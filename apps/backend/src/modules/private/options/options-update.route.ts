import Elysia from "elysia";
import z from "zod";
import { general } from "#/shared/database/main-db";
import { validatePermission } from "#/lib/middlewares/validators";
import { PERMISSIONS } from "#/shared/constants/permissions";
import { createAdminActivityLog } from "../private.model";

const updateOptionsSchema = z.object({
  name: z.string().min(1),
  value: z.boolean()
})

async function updateOptions({ name, value }: z.infer<typeof updateOptionsSchema>) {
  const query = await general
    .updateTable("options")
    .set({ name, value })
    .where("name", "=", name)
    .returning(["name", "value", "title"])
    .executeTakeFirstOrThrow()

  return query;
}

export const optionsUpdate = new Elysia()
  .use(validatePermission(PERMISSIONS.OPTIONS.UPDATE))
  .post("/update", async ({ nickname, body }) => {
    const data = await updateOptions(body);

    createAdminActivityLog({ initiator: nickname, event: PERMISSIONS.OPTIONS.UPDATE })

    return { data }
  }, {
    body: updateOptionsSchema
  })