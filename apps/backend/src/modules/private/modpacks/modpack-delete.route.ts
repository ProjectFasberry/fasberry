import { validatePermission } from "#/lib/middlewares/validators";
import { PERMISSIONS } from "#/shared/constants/permissions";
import { general } from "#/shared/database/main-db";
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
  .use(validatePermission(PERMISSIONS.MODPACKS.DELETE))
  .delete("/:id", async ({ nickname, status, params }) => {
    const id = params.id;
    const data = await deleteModpack(id)

    createAdminActivityLog({ initiator: nickname, event: PERMISSIONS.MODPACKS.DELETE })

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    params: z.object({
      id: z.coerce.number()
    })
  })