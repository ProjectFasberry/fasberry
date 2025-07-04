import { auth } from "#/shared/database/auth-db";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { throwError } from "#/helpers/throw-error";
import { luckperms } from "#/shared/database/lp-db";
import { getPlayerAvatar } from "../server/skin.model";
import type { User } from "@repo/shared/types/entities/user"
import dayjs from "dayjs"
import { Donate } from "@repo/shared/types/entities/donate-type";
import { cookieSetup } from "#/lib/middlewares/cookie";

export const user = new Elysia()
  .use(cookieSetup())
  .get("/user/:nickname", async (ctx) => {
    const nickname = ctx.params.nickname;

    async function getDonate() {
      const query = await luckperms
        .selectFrom("luckperms_user_permissions")
        .innerJoin("luckperms_players", "luckperms_players.uuid", "luckperms_user_permissions.uuid")
        .select([
          "luckperms_user_permissions.permission as group"
        ])
        .where("luckperms_user_permissions.permission", "like", `%group%`)
        .where("luckperms_players.username", "=", nickname)
        .executeTakeFirst()

      if (!query) return { group: "default" as Donate }

      return { group: query.group.slice(6) as Donate }
    }

    async function getMain() {
      const query = await auth
        .selectFrom("AUTH")
        .select([
          "NICKNAME as nickname",
          "REGDATE as reg_date",
          "LOGINDATE as login_date",
          "UUID as uuid",
          "LOWERCASENICKNAME as lowercase_nickname",
        ])
        .where("NICKNAME", "=", nickname)
        .executeTakeFirst()

      if (!query) return null;

      return {
        nickname: query.nickname,
        lowercase_nickname: query.lowercase_nickname,
        uuid: query.uuid as string,
        details: {
          reg_date: dayjs(Number(query.reg_date)).toDate(),
          login_date: dayjs(Number(query.login_date)).toDate(),
        }
      }
    }

    try {
      let user: User | null = null;

      const [main, group, avatar] = await Promise.all([
        getMain(), getDonate(), getPlayerAvatar(nickname)
      ])

      if (main && group) {
        user = { ...main, ...group, avatar }
      }

      if (!user) {
        return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: null })
      }

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: user })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  })