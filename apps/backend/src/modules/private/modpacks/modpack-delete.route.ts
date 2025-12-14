import { validatePermission } from "#/lib/middlewares/validators";
import { Permissions } from "#/shared/constants/permissions";
import { general } from "#/shared/database/general-db";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import z from "zod";
import { createAdminActivityLog } from "../private.model";

async function deleteModpack(id: number) {
  const query = await general
    .deleteFrom("modpacks")
    .where("id", "=", id)
    .returning("id")
    .executeTakeFirstOrThrow();

  return query;
}

export const modpackDelete = new Elysia()
  .use(validatePermission(Permissions.get("MODPACKS.DELETE")))
  .delete("/:id", async ({ nickname, status, params }) => {
    const id = params.id;
    const data = await deleteModpack(id)
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    params: z.object({ id: z.coerce.number() }),
    afterResponse: ({ nickname: initiator, permission }) => {
      createAdminActivityLog({ initiator, event: permission })
    }
  })