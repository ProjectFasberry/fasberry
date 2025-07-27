import { main } from "#/shared/database/main-db";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { throwError } from "#/helpers/throw-error";
import { luckperms } from "#/shared/database/luckperms-db";
import { getPlayerAvatar } from "../server/skin.model";
import type { User } from "@repo/shared/types/entities/user"
import dayjs from "dayjs"
import { Donate } from "@repo/shared/types/entities/donate";
import { sessionDerive } from "#/lib/middlewares/session";
import { sqlite } from "#/shared/database/sqlite-db";
import { userDerive } from "#/lib/middlewares/user";

export const user = new Elysia()
  .use(sessionDerive())
  .use(userDerive())
  .get("/user/:nickname", async ({ nickname: initiator, ...ctx }) => {
    const recipient = ctx.params.nickname;

    async function getDonate() {
      const query = await luckperms
        .selectFrom("luckperms_user_permissions")
        .innerJoin("luckperms_players", "luckperms_players.uuid", "luckperms_user_permissions.uuid")
        .select([
          "luckperms_user_permissions.permission as group"
        ])
        .where("luckperms_user_permissions.permission", "like", `%group%`)
        .where("luckperms_players.username", "=", recipient)
        .executeTakeFirst()

      if (!query) return { group: "default" as Donate }

      return { group: query.group.slice(6) as Donate }
    }

    async function getDetails() {
      const result = await sqlite
        .selectFrom("likes")
        .select([
          sqlite.fn.countAll().as("count"),
          sqlite.fn
            .sum(
              sqlite
                .case()
                .when("initiator", "=", initiator)
                .then(1)
                .else(0)
                .end()
            )
            .as("isRatedByInitiator")
        ])
        .where("recipient", "=", recipient)
        .executeTakeFirst();

      return {
        count: Number(result?.count ?? 0),
        isRated: (Number(result?.isRatedByInitiator ?? 0)) > 0
      };
    }

    async function getMain() {
      const query = await main
        .selectFrom("AUTH")
        .select([
          "NICKNAME as nickname",
          "REGDATE as reg_date",
          "LOGINDATE as login_date",
          "UUID as uuid",
          "LOWERCASENICKNAME as lowercase_nickname",
        ])
        .where("NICKNAME", "=", recipient)
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

      const [main, group, avatar, details] = await Promise.all([
        getMain(), getDonate(), getPlayerAvatar(recipient), getDetails()
      ])

      if (main && group) {
        user = {
          ...main,
          ...group,
          avatar,
          details: {
            ...main.details,
            rate: details
          }
        }
      }

      if (!user) {
        return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: null })
      }

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: user })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  })