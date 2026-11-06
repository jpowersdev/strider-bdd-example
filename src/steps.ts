import { Expect, type Page } from "@usestrider/browser"
import { Effect, Schema } from "effect"
import { Bdd } from "effect-bdd"
import { ScenarioPage } from "./scenario-page.ts"

// Steps the features share, each passing the page on as the scenario's state

const path = Bdd.capture("path", Schema.String)
const text = Bdd.capture("text", Schema.String)
const label = Bdd.capture("label", Schema.String)

export const givenPageOpen = Bdd.given`The Internet's "${path}" page is open`(
  Effect.fn("givenPageOpen")(function*({ path }) {
    const page = yield* ScenarioPage
    yield* page.goto(`https://the-internet.herokuapp.com${path}`, { waitUntil: "load" })
    return page
  })
)

export const whenIClick = Bdd.when`I click "${label}"`(
  Effect.fn("whenIClick")(function*({ label }, page: Page.Page) {
    yield* page.getByRole("button", { name: label }).click()
    return page
  })
)

export const thenISee = Bdd.then`I see "${text}"`(
  Effect.fn("thenISee")(function*({ text }, page: Page.Page) {
    yield* page.getByText(text).pipe(Expect.toBeVisible)
    return page
  })
)
