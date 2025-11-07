import { validatePermission } from "#/lib/middlewares/validators"
import { PERMISSIONS } from "#/shared/constants/permissions"
import { general } from "#/shared/database/main-db"
import Elysia from "elysia"
import z from "zod"
import { createAdminActivityLog } from "../private.model"

async function addPermissionForRole(
  roleId: number,
  { permissions }: z.infer<typeof rolesAddPermissionForRoleSchema>
) {
  const values = permissions.map((p) => ({
    role_id: roleId,
    permission_id: p
  }))

  const query = await general
    .insertInto("role_permissions")
    .values(values)
    .executeTakeFirstOrThrow()

  const result = query.numInsertedOrUpdatedRows

  return Number(result);
}

const rolesAddPermissionForRoleSchema = z.object({
  permissions: z.array(z.coerce.number()).min(1)
})

export const rolesAddPermissionForRole = new Elysia()
  .use(validatePermission(PERMISSIONS.ROLES.UPDATE))
  .post("/:id/permission/add", async ({ params, body }) => {
    const id = params.id
    const data = await addPermissionForRole(id, body)
    return { data }
  }, {
    body: rolesAddPermissionForRoleSchema,
    params: z.object({ id: z.coerce.number() }),
    afterResponse: ({ nickname: initiator, permission }) => {
      createAdminActivityLog({ initiator, event: permission })
    }
  })