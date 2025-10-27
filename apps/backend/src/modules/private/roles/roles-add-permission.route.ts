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
  .post("/:roleId/permission/add", async ({ nickname, params, body }) => {
    const roleId = params.roleId
    const data = await addPermissionForRole(roleId, body)

    createAdminActivityLog({ initiator: nickname, event: PERMISSIONS.ROLES.UPDATE })

    return { data }
  }, {
    body: rolesAddPermissionForRoleSchema,
    params: z.object({
      roleId: z.coerce.number()
    })
  })