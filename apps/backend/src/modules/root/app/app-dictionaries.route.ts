import { general } from "#/shared/database/main-db"
import Elysia from "elysia"
import { HttpStatusEnum } from "elysia-http-status-code/status"

export const appDictionaries = new Elysia()
  .get("/dictionaries", async ({ status }) => {
    const query = await general
      .selectFrom("dictionaries")
      .select(["key", "value"])
      .execute()

    const data = query.reduce<Record<string, string>>((acc, cur) => {
      acc[cur.key] = cur.value;
      return acc;
    }, {});

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  })