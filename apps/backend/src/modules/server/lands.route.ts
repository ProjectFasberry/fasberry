import { bisquite } from "#/shared/database/bisquite-db";
import Elysia, { t } from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { cacheSetup } from "../global/setup";
import { CacheControl } from "elysiajs-cdn-cache";
import { throwError } from "#/helpers/throw-error";
import { executeWithCursorPagination } from "kysely-paginate";

async function getLand(id: string) {
  const query = await bisquite
    .selectFrom("lands_players")
    .innerJoin("lands_lands", "lands_players.edit_land", "lands_lands.ulid")
    .innerJoin("lands_lands_claims", "lands_lands_claims.land", "lands_lands.ulid")
    .select([
      "lands_lands.area",
      "lands_lands.name",
      "lands_lands.members",
      "lands_lands.type",
      "lands_lands.created_at",
      "lands_lands.title",
      "lands_lands.stats",
      "lands_lands.balance",
      "lands_lands.limits",
      "lands_lands.level",
      "lands_lands_claims.chunks_amount",
      "lands_lands_claims.areas_amount"
    ])
    .where("ulid", "=", id)
    .executeTakeFirst()

  if (!query) {
    return null;
  }

  const land = {
    ...query,
    limits: query.limits ? JSON.parse(query.limits) : null,
    stats: query.stats ? JSON.parse(query.stats) : null,
    area: JSON.parse(query.area),
    members: await Promise.all(Object.keys(JSON.parse(query.members)).map(async (member) => {
      const { name: nickname } = await bisquite
        .selectFrom("lands_players")
        .select("name")
        .where("uuid", "=", member)
        .executeTakeFirstOrThrow();

      return {
        uuid: member,
        nickname
      }
    }))
  }

  return land
}

export const land = new Elysia()
  .use(cacheSetup)
  .get("/land/:id", async (ctx) => {
    const { id } = ctx.params

    try {
      const data = await getLand(id)
      
      ctx.cacheControl.set(
        "Cache-Control",
        new CacheControl()
          .set("public", true)
          .set("max-age", 30)
          .set("s-maxage", 30)
      );

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  })

const landsByNicknameSchema = t.Object({
  exclude: t.Optional(t.String())
})

type LandMember = {
  [key: string]: {
    chunks: number
  }
}

export async function getLandsByNickname(nickname: string) {
  const player = await bisquite
    .selectFrom("lands_players")
    .select("uuid")
    .where("name", "=", nickname)
    .executeTakeFirst()

  if (!player) return null;

  const lands = await bisquite
    .selectFrom("lands_lands")
    .select(["area", "name", "members", "type", "created_at", "title", "ulid", "balance"])
    .where(
      "members",
      "like",
      `%${player.uuid}%`
    )
    .execute();

  if (!lands.length) return null;

  const allMemberUUIDs = new Set<string>();

  const parsedLands = lands.map((land) => {
    const members: LandMember = JSON.parse(land.members);

    Object.keys(members).forEach((uuid) => allMemberUUIDs.add(uuid));

    return { ...land, area: JSON.parse(land.area), members };
  });

  const membersList = await bisquite
    .selectFrom("lands_players")
    .select(["uuid", "name"])
    .where("uuid", "in", Array.from(allMemberUUIDs))
    .execute();

  const nicknameMap = new Map(
    membersList.map(({ uuid, name }) => [uuid, name])
  );

  return parsedLands.map((land) => ({
    ...land,
    members: Object.entries(land.members).map(([uuid, data]) => ({
      uuid,
      nickname: nicknameMap.get(uuid) || "Unknown",
      chunks: data.chunks,
    })),
  }));
}

export const playerLands = new Elysia()
  .get("/lands/:nickname", async (ctx) => {
    const { nickname } = ctx.params
    const { exclude } = ctx.query;

    try {
      let lands = await getLandsByNickname(nickname)

      if (!lands) {
        return ctx.status(HttpStatusEnum.HTTP_404_NOT_FOUND, { data: [] })
      }

      if (exclude) {
        lands = lands.filter(land => land.ulid !== exclude)
      }

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: lands })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e));
    }
  }, { query: landsByNicknameSchema })

type GetLands = {
  cursor?: string
}

async function getLands({
  cursor
}: GetLands) {
  const query = bisquite
    .selectFrom("lands_lands")
    .selectAll()
    .orderBy("created_at", "desc")

  const res = await executeWithCursorPagination(query, {
    perPage: 16,
    after: cursor,
    fields: [
      {
        key: "created_at",
        direction: "desc",
        expression: "created_at",
      }
    ],
    parseCursor: (cursor) => {
      return {
        created_at: new Date(cursor.created_at),
      }
    },
  })

  const lands = res.rows.map(land => {
    return {
      ...land,
      members: JSON.parse(land.members),
      area: JSON.parse(land.area),
    }
  })

  return {
    data: lands,
    meta: {
      startCursor: res.startCursor,
      endCursor: res.endCursor,
      hasNextPage: res.hasNextPage ?? false,
      hasPrevPage: res.hasPrevPage ?? false
    }
  }
}

const landsSchema = t.Object({
  cursor: t.Optional(t.String())
})

export const lands = new Elysia()
  .get("/lands", async (ctx) => {
    const { cursor } = ctx.query

    try {
      const lands = await getLands({ cursor })

      return ctx.status(HttpStatusEnum.HTTP_200_OK, lands)
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  }, { query: landsSchema })