import { general } from "#/shared/database/main-db"
import Elysia from "elysia"
import { HttpStatusEnum } from "elysia-http-status-code/status"

export const paymentMethods = new Elysia()
  .get("/methods", async ({ status }) => {
    const data = await general
      .selectFrom("payment_methods")
      .select(["id", "imageUrl", "title", "description", "value"])
      .where("isAvailable", "=", true)
      .execute()

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  })