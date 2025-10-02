import { throwError } from "#/helpers/throw-error";
import Elysia, { Static, t } from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { executeWithCursorPagination } from "kysely-paginate";
import { lobby } from "#/shared/database/lobby-db";
import { playerpoints } from "#/shared/database/playerpoints-db";
import { bisquite } from "#/shared/database/bisquite-db";
import { reputation } from "#/shared/database/reputation-db";

const ratingSchema = t.Object({
  by: t.UnionEnum(["charism", "belkoin", "lands_chunks", "reputation", "playtime", "parkour"]),
  limit: t.Optional(t.Number()),
  cursor: t.Optional(t.String()),
  ascending: t.Optional(t.Boolean())
})

const DEFAULT_LIMIT = 50

async function getRatingBy({
  by, ascending, cursor, limit = DEFAULT_LIMIT
}: Static<typeof ratingSchema>) {
  const direction = ascending ? "asc" : "desc"

  switch (by) {
    case "parkour":
      const parkourQuery = lobby
        .selectFrom("ajparkour_scores")
        .innerJoin("ajparkour_players", "ajparkour_players.id", "ajparkour_scores.player")
        .select([
          "ajparkour_players.gamesplayed",
          "ajparkour_scores.player",
          "ajparkour_scores.score",
          "ajparkour_players.name as nickname",
          "ajparkour_scores.area"
        ])
        .where("ajparkour_scores.area", "!=", "overall") // overall - scores from all areas

      const parkourRes = await executeWithCursorPagination(parkourQuery, {
        perPage: limit,
        after: cursor,
        fields: [
          { key: "score", direction, expression: "score" }
        ],
        parseCursor: (cursor) => ({ score: Number(cursor.score) })
      })

      return {
        data: parkourRes.rows,
        meta: {
          hasNextPage: parkourRes.hasNextPage,
          hasPrevPage: parkourRes.hasPrevPage,
          startCursor: parkourRes.startCursor,
          endCursor: parkourRes.endCursor,
        }
      }
    case "charism":
      const charismQuery = bisquite
        .selectFrom("CMI_users")
        .select([
          "Balance as balance", 
          "username as nickname"
        ])

      const charismRes = await executeWithCursorPagination(charismQuery, {
        perPage: limit,
        after: cursor,
        fields: [
          { key: "balance", direction, expression: "Balance" }
        ],
        parseCursor: (cursor) => ({ balance: Number(cursor.balance) })
      })

      return {
        data: charismRes.rows,
        meta: {
          hasNextPage: charismRes.hasNextPage,
          hasPrevPage: charismRes.hasPrevPage,
          startCursor: charismRes.startCursor,
          endCursor: charismRes.endCursor,
        }
      }
    case "belkoin":
      const belkoinQuery = playerpoints
        .selectFrom("playerpoints_points")
        .innerJoin("playerpoints_username_cache", "playerpoints_points.uuid", "playerpoints_username_cache.uuid")
        .select([
          "playerpoints_points.points",
          "playerpoints_username_cache.username as nickname"
        ])

      const belkoinRes = await executeWithCursorPagination(belkoinQuery, {
        perPage: limit,
        after: cursor,
        fields: [
          { key: "points", direction, expression: "points" }
        ],
        parseCursor: (cursor) => ({ points: Number(cursor.points) })
      })

      return {
        data: belkoinRes.rows,
        meta: {
          hasNextPage: belkoinRes.hasNextPage,
          hasPrevPage: belkoinRes.hasPrevPage,
          startCursor: belkoinRes.startCursor,
          endCursor: belkoinRes.endCursor,
        }
      }
    case "lands_chunks":
      const landsQuery = bisquite
        .selectFrom("lands_lands_claims")
        .innerJoin("lands_lands", "lands_lands_claims.land", "lands_lands.ulid")
        .select([
          "lands_lands_claims.land",
          "lands_lands_claims.chunks_amount",
          "lands_lands_claims.blocks",
          "lands_lands.name",
          "lands_lands.members",
          "lands_lands.type"
        ])

      let landsRes = await executeWithCursorPagination(landsQuery, {
        perPage: limit,
        after: cursor,
        fields: [
          { key: "chunks_amount", direction, expression: "chunks_amount" }
        ],
        parseCursor: (cursor) => ({ chunks_amount: Number(cursor.chunks_amount) })
      })

      landsRes.rows = landsRes.rows.map((item) => {
        return {
          ...item,
          members: JSON.parse(item.members),
          chunks_amount: Number(item.chunks_amount),
          blocks: item.blocks ? JSON.parse(item.blocks) : null,
        }
      })

      return {
        data: landsRes.rows,
        meta: {
          hasNextPage: landsRes.hasNextPage,
          hasPrevPage: landsRes.hasPrevPage,
          startCursor: landsRes.startCursor,
          endCursor: landsRes.endCursor,
        }
      }
    case "reputation":
      const reputationQuery = reputation
        .selectFrom("reputation")
        .select([
          "reputation", 
          "reputation.uuid"
        ])

      const reputationRes = await executeWithCursorPagination(reputationQuery, {
        perPage: limit,
        after: cursor,
        fields: [
          { key: "reputation", direction, expression: "reputation" }
        ],
        parseCursor: (cursor) => ({ reputation: Number(cursor.reputation) })
      })

      const result = await Promise.all(reputationRes.rows.map(async (row) => {
        const { nickname, uuid } = await bisquite
          .selectFrom("CMI_users")
          .select([
            "username as nickname", 
            "player_uuid as uuid"
          ])
          .where("player_uuid", "=", row.uuid)
          .executeTakeFirstOrThrow()

        return {
          reputation: row.reputation ?? 0,
          uuid: row.uuid ?? uuid,
          nickname: nickname as string
        }
      }))

      return {
        data: result,
        meta: {
          hasNextPage: reputationRes.hasNextPage,
          hasPrevPage: reputationRes.hasPrevPage,
          startCursor: reputationRes.startCursor,
          endCursor: reputationRes.endCursor,
        }
      }
    case "playtime":
      const playtimeQuery = bisquite
        .selectFrom('CMI_users')
        .select([
          "TotalPlayTime as total", 
          "username as nickname"
        ])

      const playtimeRes = await executeWithCursorPagination(playtimeQuery, {
        perPage: limit,
        after: cursor,
        fields: [
          { key: "total", direction, expression: "TotalPlayTime" }
        ],
        parseCursor: (cursor) => ({ total: Number(cursor.total) })
      })

      return {
        data: playtimeRes.rows,
        meta: {
          hasNextPage: playtimeRes.hasNextPage,
          hasPrevPage: playtimeRes.hasPrevPage,
          startCursor: playtimeRes.startCursor,
          endCursor: playtimeRes.endCursor,
        }
      }
    default:
      throw new Error(`Invalid type: ${by}`)
  }
}

export const ratingBy = new Elysia()
  .get("/rating", async (ctx) => {
    const { by, limit, cursor, ascending } = ctx.query;

    try {
      const res = await getRatingBy({ by, limit, cursor, ascending })

      ctx.set.headers["Cache-Control"] = "public, max-age=60, s-maxage=60"

      return ctx.status(HttpStatusEnum.HTTP_200_OK, res)
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e));
    }
  }, { query: ratingSchema })