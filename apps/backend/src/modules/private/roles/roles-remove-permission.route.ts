import { validatePermission } from "#/lib/middlewares/validators"
import { PERMISSIONS } from "#/shared/constants/permissions"
import { general } from "#/shared/database/main-db"
import Elysia from "elysia"
import z from "zod"
import { createAdminActivityLog } from "../private.model"

async function removePermissionForRole(
  roleId: number,
  { permissions }: z.infer<typeof rolesRemovePermissionForRoleSchema>
) {
  const query = await general
    .deleteFrom("role_permissions")
    .where("permission_id", "in", permissions)
    .where("role_id", "=", roleId)
    .executeTakeFirstOrThrow()

  const result = query.numDeletedRows

  return Number(result);
}

const rolesRemovePermissionForRoleSchema = z.object({
  permissions: z.array(z.coerce.number()).min(1)
})

export const rolesRemovePermissionForRole = new Elysia()
  .use(validatePermission(PERMISSIONS.ROLES.UPDATE))
  .delete("/:roleId/permission/remove", async ({ nickname, params, body }) => {
    const roleId = params.roleId
    const data = await removePermissionForRole(roleId, body)

    createAdminActivityLog({ initiator: nickname, event: PERMISSIONS.ROLES.UPDATE })
    
    return { data }
  }, {
    body: rolesRemovePermissionForRoleSchema,
    params: z.object({
      roleId: z.coerce.number()
    })
  })