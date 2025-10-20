import { general } from "#/shared/database/main-db";
import { MeOptions } from "@repo/shared/types/entities/user";
import { sql } from "kysely";

export async function defineOptions(
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

export async function getMe(nickname: string) {
  return general
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
}