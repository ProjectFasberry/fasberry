import { general } from "#/shared/database/main-db"
import Elysia from "elysia"

export const optionsList = new Elysia()
  .get("/list", async (ctx) => {
    const data = await general
      .selectFrom("options")
      .select([
        "name",
        "value",
        "title"
      ])
      .execute()

    return { data }
  })