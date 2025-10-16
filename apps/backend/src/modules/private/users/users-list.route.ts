import Elysia from "elysia";
import { PrivatedUsersPayload } from "@repo/shared/types/entities/other";
import { getDirection } from "#/utils/config/paginate";
import { general } from "#/shared/database/main-db";
import { sql } from "kysely";
import { executeWithCursorPagination } from "kysely-paginate";
import { wrapMeta } from "#/utils/config/transforms";
import z from "zod";
import { metaSchema, searchQuerySchema } from "#/shared/schemas";

const USER_SORT = ["abc", "created_at", "role"]

const userListSchema = z.intersection(
  metaSchema,
  z.object({
    sort: z.enum(USER_SORT).optional().default(USER_SORT[0]),
    searchQuery: searchQuerySchema
  })
)

type UserListSchema = z.infer<typeof userListSchema>
type RequestedFields = "created_at" | "nickname" | "role_id"

const EXPRESSIONS: Record<UserListSchema["sort"], RequestedFields> = {
  "abc": "nickname",
  "created_at": "created_at",
  "role": "role_id"
}

async function getUsersList({ asc, startCursor, searchQuery, endCursor, limit, sort }: UserListSchema) {
  const direction = getDirection(asc);

  let query = general
    .selectFrom("players")
    // .innerJoin("players_status", "players_status.nickname", "players.nickname") // todo: impl player status table
    .innerJoin("roles", "roles.id", "players.role_id")
    .select([
      "players.id",
      "players.created_at as created_at",
      "players.nickname as nickname",
      "players.lower_case_nickname",
      "players.premium_uuid",
      "players.uuid",
      "roles.id as role_id",
      "roles.name as role_name"
    ])

  if (searchQuery) {
    const searchQueryLower = searchQuery.toLowerCase();

    query = query
      .where(
        sql<boolean>`players.nickname ILIKE ${`%${searchQueryLower}%`} 
          OR players.nickname_tsv @@ websearch_to_tsquery('simple', ${searchQueryLower})`
      )
      .orderBy(
        sql`ts_rank_cd(players.nickname_tsv, websearch_to_tsquery('simple', ${searchQueryLower}))`,
        "desc"
      );
  }

  const expression = EXPRESSIONS[sort];

  const config = {
    after: endCursor,
    before: startCursor,
    perPage: limit,
  }

  const result = await executeWithCursorPagination(query, {
    ...config,
    fields: [
      { expression, direction }
    ],
    parseCursor: (cursor) => {
      const payload = {
        nickname: cursor.nickname,
        created_at: new Date(cursor.created_at),
        role_id: Number(cursor.role_id)
      }

      return payload
    }
  })

  const data = result.rows.map((user => ({ ...user, status: "default" as "banned" | "default" | "muted" })))

  return {
    data,
    meta: wrapMeta(result)
  }
}

export const usersList = new Elysia()
  .get("/list", async ({ query }) => {
    const data: PrivatedUsersPayload = await getUsersList(query);
    return { data }
  }, {
    query: userListSchema
  })