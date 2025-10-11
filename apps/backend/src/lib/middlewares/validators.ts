import Elysia from "elysia";
import { defineSession, defineUserRole } from "./define";
import { general } from "#/shared/database/main-db";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { getUserNickname } from "#/modules/auth/auth.model";

export const validatePermission = () => new Elysia()
  .use(defineUserRole())
  .derive(async ({ query: { event }, role, status }) => {
    const permission = event;

    const query = await general
      .selectFrom("permissions")
      .innerJoin("role_permissions", "role_permissions.permission_id", "permission_id")
      .select(eb => [
        "role_permissions.role_id",
        "role_permissions.permission_id as permission_id",
        "permissions.name as permission_name",
      ])
      .where("role_permissions.role_id", "=", role.id)
      .where("permissions.name", "=", permission)
      .executeTakeFirst();

    if (!query || !query.role_id) {
      throw status(HttpStatusEnum.HTTP_400_BAD_REQUEST, "Restricted by role")
    }

    return {
      role,
      permission: {
        id: query.permission_id,
        name: query.permission_name
      }
    }
  })
  .as("scoped")

export const validateAuthStatus = () => new Elysia()
  .use(defineSession())
  .onBeforeHandle(async ({ session, status }) => {
    if (session) {
      const nickname = await getUserNickname(session);
      console.log(session, nickname);

      if (nickname) {
        throw status(HttpStatusEnum.HTTP_406_NOT_ACCEPTABLE, "Authorized")
      }
    }
  })
  .as("scoped")