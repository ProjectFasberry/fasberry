import Elysia from "elysia";
import { defineOptionalUser, defineSession, defineUserRole, validateLogger } from "./define";
import { general } from "#/shared/database/main-db";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { getUserNickname } from "#/modules/auth/auth.model";

export const validatePermission = () => new Elysia()
  .use(defineUserRole())
  .derive(async ({ query: { event }, role, status }) => {
    validateLogger.log("validatePermission");

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
      throw status(HttpStatusEnum.HTTP_400_BAD_REQUEST, "restricted by role")
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
      validateLogger.log("validateAuthStatus");

      const nickname = await getUserNickname(session);
      console.log(session, nickname);

      if (nickname) {
        throw status(HttpStatusEnum.HTTP_406_NOT_ACCEPTABLE, "authorized")
      }
    }
  })
  .as("scoped")

export const validateBannedStatus = () => new Elysia()
  .use(defineOptionalUser())
  .onBeforeHandle(async ({ nickname, status }) => {
    if (nickname) {
      validateLogger.log("validateBannedStatus");

      const isExist = await general
        .selectFrom("banned_users")
        .innerJoin("players", "players.nickname", "banned_users.nickname")
        .where("banned_users.nickname", "=", nickname)
        .where("players.role_id", "=", 1) // where role_id=1 -> default role
        .select("banned_users.id")
        .executeTakeFirst()

      if (isExist && isExist.id) {
        throw status(HttpStatusEnum.HTTP_400_BAD_REQUEST, "banned")
      }
    }
  })
  .as("scoped")