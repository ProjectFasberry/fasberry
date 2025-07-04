import Elysia from "elysia"

export const cookieSetup = () => new Elysia()
  .derive(
    { as: "global" },
    ({ cookie }) => ({ session: cookie["session"].value ?? null })
  )