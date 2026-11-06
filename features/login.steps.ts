import type { Page } from "@usestrider/browser"
import { Effect, Schema } from "effect"
import { Bdd } from "effect-bdd"
import { scenarioPage } from "../src/scenario-page.ts"
import { givenPageOpen, thenISee } from "../src/steps.ts"

const username = Bdd.capture("username", Schema.String)
const password = Bdd.capture("password", Schema.String)

const whenILogIn = Bdd.when`I log in as "${username}" with "${password}"`(
  Effect.fn("whenILogIn")(function*({ username, password }, page: Page.Page) {
    yield* page.getByLabel("Username").fill(username)
    yield* page.getByLabel("Password").fill(password)
    yield* page.getByRole("button", { name: "Login" }).click()
    return page
  })
)

const loggingIn = Bdd.scenario("Logging in").pipe(
  givenPageOpen,
  whenILogIn,
  thenISee,
  Bdd.provide(scenarioPage("logging-in"))
)

const wrongPassword = Bdd.scenario("A wrong password").pipe(
  givenPageOpen,
  whenILogIn,
  thenISee,
  Bdd.provide(scenarioPage("a-wrong-password"))
)

export const login = Bdd.feature("Login").pipe(loggingIn, wrongPassword)
