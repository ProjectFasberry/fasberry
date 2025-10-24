import Elysia, { t } from "elysia"
import { getStaticUrl } from "#/helpers/volume"
import { general } from "#/shared/database/main-db"
import { withData } from "#/shared/schemas"
import { MethodsPayload } from "@repo/shared/types/entities/other"
import { HttpStatusEnum } from "elysia-http-status-code/status"

const methodPayload = t.Object({
  id: t.Number(),
  description: t.Nullable(t.String()),
  imageUrl: t.String(),
  title: t.String(),
  value: t.String(),
})

async function getMethods() {
  let query = await general
    .selectFrom("payment_methods")
    .select(["id", "imageUrl", "title", "description", "value"])
    .where("isAvailable", "=", true)
    .execute()

  query = query.map((method) => ({
    ...method,
    imageUrl: getStaticUrl(method.imageUrl)
  }))
  
  return query
}

export const paymentMethods = new Elysia()
  .model({
    "methods": withData(
      t.Array(methodPayload)
    )
  })
  .get("/methods", async ({ status }) => {
    const data: MethodsPayload = await getMethods()
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    response: {
      200: "methods"
    }
  })