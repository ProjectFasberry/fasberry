import { validatePermission } from "#/lib/middlewares/validators";
import { PERMISSIONS } from "#/shared/constants/permissions";
import { general } from "#/shared/database/main-db";
import Elysia from "elysia";
import { createAdminActivityLog } from "../private.model";
import z from "zod";

export const dictionariesCreate = new Elysia()
  .use(validatePermission(PERMISSIONS.DICTIONARIES.CREATE))
  .post("/create", async ({ body }) => {
    const { key, value } = body;

    const data = await general
      .insertInto("dictionaries")
      .values({
        key, value
      })
      .returningAll()
      .executeTakeFirstOrThrow()

    return { data }
  }, {
    body: z.object({
      key: z.enum(["title", "key"]),
      value: z.string()
    }),
    afterResponse: ({ permission, nickname: initiator }) => {
      createAdminActivityLog({ initiator, event: permission })
    }
  })
