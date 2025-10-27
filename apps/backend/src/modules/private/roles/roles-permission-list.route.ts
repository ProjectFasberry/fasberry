import { validatePermission } from "#/lib/middlewares/validators";
import { PERMISSIONS } from "#/shared/constants/permissions";
import { general } from "#/shared/database/main-db";
import { RolesRolePermissionListPayload } from "@repo/shared/types/entities/role";
import Elysia from "elysia";
import z from "zod";

export const rolesRolePermissionList = new Elysia()
  .use(validatePermission(PERMISSIONS.ROLES.READ))
  .get("/:roleId/permission/list", async ({ params }) => {
    const roleId = params.roleId;

    const query = await general
      .selectFrom("role_permissions")
      .innerJoin("permissions", "permissions.id", "role_permissions.permission_id")
      .select([
        "role_permissions.permission_id as permission_id",
        "permissions.name as permission_name"
      ])
      .where("role_permissions.role_id", "=", roleId)
      .execute();

    const data: RolesRolePermissionListPayload = {
      role_id: roleId,
      permissions: query.map(r => ({
        id: r.permission_id,
        name: r.permission_name
      }))
    };

    return { data }
  }, {
    params: z.object({
      roleId: z.coerce.number()
    })
  })