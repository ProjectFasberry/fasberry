import { RolePayload } from '@repo/shared/types/entities/role';
import { validatePermission } from "#/lib/middlewares/validators";
import { PERMISSIONS } from "#/shared/constants/permissions";
import { general } from "#/shared/database/main-db";
import Elysia from "elysia";

export const rolesList = new Elysia()
  .use(validatePermission(PERMISSIONS.ROLES.READ))
  .get("/list", async (ctx) => {
    const data: RolePayload[] = await general
      .selectFrom("roles")
      .select(["id", "name"])
      .orderBy("id", "asc")
      .execute();

    return { data }
  })