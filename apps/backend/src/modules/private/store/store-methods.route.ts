import Elysia from "elysia";
import { general } from "#/shared/database/main-db";
import z from "zod";
import { PrivatedMethodsPayload } from "@repo/shared/types/entities/other";

export const storeMethodsList = new Elysia()
  .get("/list", async (ctx) => {
    const data: PrivatedMethodsPayload = await general
      .selectFrom("payment_methods")
      .selectAll()
      .execute()

    return { data }
  })

export const storeMethodsEdit = new Elysia()
  .post("/edit/:method", async ({ params, body }) => {
    const method = params.method;
    const { key, value } = body;

    const data = await general
      .updateTable("payment_methods")
      .set({ [key]: value })
      .where("value", "=", method)
      .returning([key])
      .executeTakeFirstOrThrow()

    return { data }
  }, {
    body: z.object({
      key: z.enum(["isAvailable", "title", "imageUrl", "value"]),
      value: z.string().or(z.stringbool()).or(z.boolean())
    })
  })