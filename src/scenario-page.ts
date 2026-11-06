import { NodeServices } from "@effect/platform-node"
import { Browser, type Page } from "@usestrider/browser"
import { Chromium } from "@usestrider/browser/chromium"
import { Config, Context, Effect, Exit, FileSystem, Layer } from "effect"
import { recordVideo } from "./video.ts"

/** The page a scenario's steps act on */
export class ScenarioPage extends Context.Service<ScenarioPage, Page.Page>()("ScenarioPage") {}

const ChromiumLive = Chromium.layerConfig({
  executablePath: Config.String("CHROMIUM_PATH")
}).pipe(Layer.provide(NodeServices.layer))

/**
 * A browser and page for one scenario, recorded to `artifacts/<name>.webm`, with a
 * full-page screenshot in `artifacts/<name>.png` if the scenario fails. Provide it with
 * `Bdd.provide`: effect-bdd builds it as the scenario starts and closes it as it ends.
 */
export const scenarioPage = (name: string) =>
  Layer.effect(
    ScenarioPage,
    Effect.gen(function*() {
      const fs = yield* FileSystem.FileSystem
      yield* fs.makeDirectory("artifacts", { recursive: true })
      const page = yield* Browser.newPage({
        emulation: { viewport: { width: 1280, height: 720 } }
      })
      yield* recordVideo(page, `artifacts/${name}.webm`)
      // Added after the page opened, so it runs before the page closes
      yield* Effect.addFinalizer((exit) =>
        Exit.isFailure(exit)
          ? page.screenshot({ area: { _tag: "FullPage" } }).pipe(
            Effect.flatMap((png) => fs.writeFile(`artifacts/${name}.png`, png)),
            Effect.ignore
          )
          : Effect.void
      )
      return page
    })
  ).pipe(Layer.provide([ChromiumLive, NodeServices.layer]))
