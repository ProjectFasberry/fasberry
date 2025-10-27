import Elysia from "elysia"
import { HttpStatusEnum } from "elysia-http-status-code/status"

export const appDictionaries = new Elysia()
  .get("/dictionaries", async ({ status }) => {
    const data = {
      "CHARISM": "Харизма",
      "BELKOIN": "Белкоин",
      "moderator": "Модератор",
      "admin": "Админ",
      "player": "Игрок"
    }

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  })