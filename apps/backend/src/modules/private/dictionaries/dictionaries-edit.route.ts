import { validatePermission } from "#/lib/middlewares/validators";
import { PERMISSIONS } from "#/shared/constants/permissions";
import Elysia from "elysia";
import { createAdminActivityLog } from "../private.model";
import z from "zod";
import { general } from "#/shared/database/main-db";

export const dictionariesEdit = new Elysia()
  .use(validatePermission(PERMISSIONS.DICTIONARIES.UPDATE))
  .post("/:id/edit", async ({ params, body }) => {
    const id = params.id;
    const { key, value } = body;

    const data = await general
      .updateTable("dictionaries")
      .set({
        [key]: value
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow()

    return { data }
  }, {
    body: z.object({
      key: z.enum(["title", "key"]),
      value: z.string()
    }),
    params: z.object({ id: z.coerce.number() }),
    afterResponse: ({ permission, nickname: initiator }) => {
      createAdminActivityLog({ initiator, event: permission })
    }
  })