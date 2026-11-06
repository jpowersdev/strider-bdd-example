import { Capability, type Page } from "@usestrider/browser"
import { Deferred, Effect, Ref, Schedule, Stream } from "effect"
import { ChildProcess } from "effect/process"

/**
 * Records a page to a WebM file until the caller's scope closes.
 *
 * Chromium has no video file of its own, only a screencast: a JPEG each time the page
 * repaints. So the latest frame is taken 25 times a second and piped to ffmpeg, which
 * reads them at 25 frames a second and encodes them as VP9. ffmpeg must be on PATH.
 */
export const recordVideo = Effect.fn("recordVideo")(function*(page: Page.Page, file: string) {
  const screencast = yield* page.capability(Capability.Screencast)
  const latest = yield* Ref.make<Uint8Array | undefined>(undefined)
  yield* screencast.frames.pipe(
    Stream.runForEach((frame) => Ref.set(latest, frame.jpeg)),
    Effect.ignore,
    Effect.forkScoped
  )
  const stop = yield* Deferred.make<void>()
  const frames = Stream.fromSchedule(Schedule.fixed("40 millis")).pipe(
    Stream.mapEffect(() => Ref.get(latest)),
    Stream.filter((jpeg) => jpeg !== undefined),
    Stream.interruptWhen(Deferred.await(stop))
  )
  const ffmpeg = yield* ChildProcess.make({ stdin: frames, stderr: "inherit" })`
    ffmpeg -loglevel error -f mjpeg -framerate 25 -i pipe:0
      -c:v libvpx-vp9 -crf 36 -b:v 0 -deadline realtime -cpu-used 8
      -y ${file}`
  // When the scope closes: one more second, so the last paint is in the video, then
  // the frames end and ffmpeg finishes the file
  yield* Effect.addFinalizer(() =>
    Effect.sleep("1 second").pipe(
      Effect.andThen(Deferred.succeed(stop, undefined)),
      Effect.andThen(ffmpeg.exitCode),
      Effect.ignore
    )
  )
})
