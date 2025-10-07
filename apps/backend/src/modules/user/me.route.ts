import Elysia from "elysia";
import dayjs from 'dayjs';
import { general } from "#/shared/database/main-db";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { defineOptionalUser } from "#/lib/middlewares/define";
import { sql } from "kysely";
import { MePayload, MeOptions } from "@repo/shared/types/entities/user"

async function defineOptions(
  role_id: number
): Promise<MeOptions> {
  const perms = await general
    .selectFrom("role_permissions")
    .innerJoin("permissions", "permissions.id", "role_permissions.permission_id")
    .select("permissions.name")
    .where("role_permissions.role_id", "<=", role_id) 
    .execute();

  return { 
    permissions: perms.map((p) => p.name) 
  };
}

export const me = new Elysia()
  .use(defineOptionalUser())
  .get("/me", async ({ nickname, status }) => {
    if (!nickname) {
      return status(HttpStatusEnum.HTTP_404_NOT_FOUND, { data: null })
    }

    const query = await general
      .selectFrom("players")
      .leftJoin(
        "activity_users", (join) => join
          .on("activity_users.nickname", "=", "players.nickname")
          .on("activity_users.type", "=", sql`'join'`)
      )
      .select([
        "players.nickname",
        "players.uuid",
        "players.role_id",
        "players.created_at as reg_date",
        "activity_users.event as login_date",
      ])
      .where("players.nickname", "=", nickname)
      .executeTakeFirst()

    if (!query) {
      return status(HttpStatusEnum.HTTP_404_NOT_FOUND, { data: null })
    }

    const { reg_date, login_date, role_id, ...base } = query;

    const options = await defineOptions(role_id);

    const loginDate = dayjs(Number(query.login_date)).toDate();
    const regDate = dayjs(Number(query.reg_date)).toDate()

    const data: MePayload = {
      ...base,
      meta: {
        login_date: loginDate,
        reg_date: regDate,
      },
      options
    }

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  })