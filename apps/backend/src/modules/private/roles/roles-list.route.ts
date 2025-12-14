import type { RolePayload } from '@repo/shared/types/entities/role';
import { validatePermission } from "#/lib/middlewares/validators";
import { Permissions } from "#/shared/constants/permissions";
import { general } from "#/shared/database/general-db";
import Elysia from "elysia";

export const rolesList = new Elysia()
  .use(validatePermission(Permissions.get("ROLES.READ")))
  .get("/list", async (ctx) => {
    const data: RolePayload[] = await general
      .selectFrom("roles")
      .select(["id", "name"])
      .orderBy("id", "asc")
      .execute();

    return { data }
  })