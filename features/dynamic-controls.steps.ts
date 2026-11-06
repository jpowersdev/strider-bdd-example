import type { Page } from "@usestrider/browser"
import { Effect, Schema } from "effect"
import { Bdd } from "effect-bdd"
import { scenarioPage } from "../src/scenario-page.ts"
import { givenPageOpen, thenISee, whenIClick } from "../src/steps.ts"

const text = Bdd.capture("text", Schema.String)

// The box is enabled by a script a few seconds after the click: fill waits for it
const whenIType = Bdd.when`I type "${text}" into the text box`(
  Effect.fn("whenIType")(function*({ text }, page: Page.Page) {
    yield* page.getByRole("textbox").fill(text)
    return page
  })
)

const enabling = Bdd.scenario("Enabling the text box").pipe(
  givenPageOpen,
  whenIClick,
  whenIType,
  thenISee,
  Bdd.provide(scenarioPage("enabling-the-text-box"))
)

export const dynamicControls = Bdd.feature("Dynamic controls").pipe(enabling)
