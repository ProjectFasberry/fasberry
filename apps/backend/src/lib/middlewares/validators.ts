import Elysia from "elysia";
import { defineOptionalUser, defineSession, defineUserRole, validateLogger } from "./define";
import { general } from "#/shared/database/main-db";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { getUserNickname } from "#/modules/auth/auth.model";
import { getPermissions } from "#/modules/user/me.model";
import { isProduction } from "#/shared/env";

export const validatePermission = (permission: string) => new Elysia()
  .use(defineUserRole())
  .derive(async ({ role, nickname, status }) => {
    if (!isProduction) {
      validateLogger.log("validatePermission");
    }

    const perms = await getPermissions(nickname, role.id)

    const targetIsExist = perms.includes(permission)

    if (!targetIsExist) {
      throw status(HttpStatusEnum.HTTP_400_BAD_REQUEST, "restricted_by_role")
    }

    return { role, permission }
  })
  .as("scoped")

export const validateAuthStatus = () => new Elysia()
  .use(defineSession())
  .onBeforeHandle(async ({ session, status }) => {
    if (session) {
      if (!isProduction) {
        validateLogger.log("validateAuthStatus");
      }

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
      if (!isProduction) {
        validateLogger.log("validateBannedStatus");
      }

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