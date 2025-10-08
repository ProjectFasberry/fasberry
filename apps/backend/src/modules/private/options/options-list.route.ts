import { general } from "#/shared/database/main-db"
import Elysia from "elysia"
import { HttpStatusEnum } from "elysia-http-status-code/status"

export const optionsList = new Elysia()
  .get("/list", async ({ status }) => {
    const data = await general
      .selectFrom("options")
      .select([
        "name",
        "value",
        "title"
      ])
      .execute()

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  })