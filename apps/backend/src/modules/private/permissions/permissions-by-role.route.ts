import { validatePermission } from "#/lib/middlewares/validators";
import { PERMISSIONS } from "#/shared/constants/permissions";
import { general } from "#/shared/database/main-db";
import Elysia from "elysia";
import z from "zod";

const permissionsSchema = z.object({
  type: z.enum(["accessed", "restricted", "all"]).optional().default("all")
})

async function getPermissionsByRole(
  roleId: number,
  { type }: z.infer<typeof permissionsSchema>
) {
  let base = general
    .selectFrom("permissions")
    .innerJoin("role_permissions", "role_permissions.permission_id", "permissions.id")
    .select([
      "permissions.id",
      "permissions.name",
      "role_permissions.permission_id",
      "role_permissions.role_id",
    ])
    .orderBy("permissions.id", "asc");

  switch (type) {
    case "accessed":
      base = base.where("role_permissions.role_id", "=", roleId);
      break;
    case "restricted":
      base = base.where("role_permissions.role_id", "!=", roleId);
      break;
    case "all":
    default:
      break;
  }

  return base.execute();
}

export const permissionsListByRole = new Elysia()
  .use(validatePermission(PERMISSIONS.PERMISSIONS.READ))
  .get("/list/:roleId", async ({ params, query }) => {
    const roleId = params.roleId;
    const data = await getPermissionsByRole(roleId, query);
    return { data }
  }, {
    query: permissionsSchema,
    params: z.object({
      roleId: z.coerce.number()
    })
  })
