import Elysia from "elysia"

export const sessionDerive = () => new Elysia()
  .derive(
    { as: "global" },
    ({ cookie }) => ({ session: cookie["session"].value ?? null })
  )