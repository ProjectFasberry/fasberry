import Elysia from "elysia";
import { general } from "#/shared/database/main-db";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import z from "zod";

export const storeMethodsList = new Elysia()
  .get("/list", async ({ status }) => {
    const data = await general
      .selectFrom("payment_methods")
      .selectAll()
      .execute()

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  })

export const storeMethodsEdit = new Elysia()
  .post("/edit/:method", async ({ params, body, status }) => {
    const method = params.method;
    const { key, value } = body;

    const data = await general
      .updateTable("payment_methods")
      .set({ [key]: value })
      .where("value", "=", method)
      .returning([key])
      .executeTakeFirstOrThrow()

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    body: z.object({
      key: z.enum(["isAvailable", "title", "imageUrl", "value"]),
      value: z.string().or(z.stringbool())
    })
  })