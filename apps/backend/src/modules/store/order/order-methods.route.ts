import { general } from "#/shared/database/main-db"
import { withData } from "#/shared/schemas"
import { MethodsPayload } from "@repo/shared/types/entities/other"
import Elysia, { t } from "elysia"

const methodPayload = t.Object({
  id: t.Number(),
  description: t.Nullable(t.String()),
  imageUrl: t.String(),
  title: t.String(),
  value: t.String(),
})

export const paymentMethods = new Elysia()
  .model({
    "methods": withData(
      t.Array(methodPayload)
    )
  })
  .get("/methods", async (ctx) => {
    const data: MethodsPayload = await general
      .selectFrom("payment_methods")
      .select(["id", "imageUrl", "title", "description", "value"])
      .where("isAvailable", "=", true)
      .execute()

    return { data }
  }, {
    response: {
      200: "methods"
    }
  })