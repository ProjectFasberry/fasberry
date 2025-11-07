import Elysia from "elysia";
import { general } from "#/shared/database/main-db";
import z from "zod";
import { PrivatedMethodsPayload } from "@repo/shared/types/entities/other";
import { getStaticUrl } from "#/helpers/volume";
import { validatePermission } from "#/lib/middlewares/validators";
import { PERMISSIONS } from "#/shared/constants/permissions";
import { createAdminActivityLog } from "../private.model";

async function getMethods() {
  let query = await general
    .selectFrom("payment_methods")
    .selectAll()
    .execute()

  query = query.map((method) => ({
    ...method,
    imageUrl: getStaticUrl(method.imageUrl)
  }))

  return query;
}

export const storeMethodsList = new Elysia()
  .use(validatePermission(PERMISSIONS.STORE.METHODS.READ))
  .get("/list", async () => {
    const data: PrivatedMethodsPayload = await getMethods()
    return { data }
  })

export const storeMethodsEdit = new Elysia()
  .use(validatePermission(PERMISSIONS.STORE.METHODS.UPDATE))
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
    }),
    afterResponse: ({ nickname: initiator, permission }) => {
      createAdminActivityLog({ initiator, event: permission })
    }
  })