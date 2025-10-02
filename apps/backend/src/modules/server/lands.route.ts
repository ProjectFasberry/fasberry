import { bisquite } from "#/shared/database/bisquite-db";
import Elysia, { Static, t } from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { CacheControl } from "elysiajs-cdn-cache";
import { throwError } from "#/helpers/throw-error";
import { executeWithCursorPagination } from "kysely-paginate";
import type { Land } from "@repo/shared/types/entities/land"
import { sessionDerive } from "#/lib/middlewares/session";
import { userDerive } from "#/lib/middlewares/user";
import { getStaticObject } from "#/helpers/volume";

async function getLand({
  id, initiator
}: {
  id: string, initiator: string | null
}): Promise<Land | null> {
  let isOwner = false;

  const landRow = await bisquite
    .selectFrom('lands_lands')
    .select(['members', "name"])
    .where('ulid', '=', id)
    .executeTakeFirstOrThrow();

  const membersObject = JSON.parse(landRow.members ?? '{}');
  const memberUUIDs = Object.keys(membersObject);

  async function getDetails() {
    if (landRow.name === 'Kingdom') {
      return {
        banner: "https://volume.fasberry.su/banners/kingdom.png",
        gallery: [getStaticObject("arts/1.png"), getStaticObject("arts/2.png"), getStaticObject("arts/3.png")]
      }
    }

    return { banner: null, gallery: [] }
  }

  async function getMembers() {
    let members = memberUUIDs.length > 0 ? await bisquite
      .selectFrom('CMI_users')
      .select([
        'player_uuid as uuid',
        'username as nickname'
      ])
      .where('player_uuid', 'in', memberUUIDs)
      .execute() : [];

    if (initiator && members.some(member => member.nickname === initiator)) {
      isOwner = true
    }

    return members.map((member, idx) => ({
      uuid: member.uuid as string,
      nickname: member.nickname as string,
      chunks: 0,
      // 4 type = owner
      // 1 type = member
      role: idx === 0 ? 4 : 1
    }))
  }

  async function getMain() {
    const OWNER_FIELDS = isOwner ? [
      "lands_lands.balance",
      "lands_lands.limits",
      "lands_lands.spawn"
    ] : []

    const query = await bisquite
      .selectFrom("lands_lands")
      .leftJoin("lands_lands_claims", "lands_lands_claims.land", "lands_lands.ulid")
      // @ts-expect-error
      .select([
        "lands_lands.ulid",
        "lands_lands.name",
        "lands_lands.area",
        "lands_lands.type",
        "lands_lands.created_at",
        "lands_lands.title",
        "lands_lands_claims.chunks_amount",
        "lands_lands_claims.areas_amount",
        "lands_lands.stats",
        "lands_lands.level",
        ...OWNER_FIELDS
      ])
      .where("lands_lands.ulid", "=", id)
      .groupBy([
        "lands_lands.ulid",
        "lands_lands.name",
        "lands_lands.area",
        "lands_lands.type",
        "lands_lands.created_at",
        "lands_lands.title",
        "lands_lands_claims.chunks_amount",
        "lands_lands_claims.areas_amount",
        "lands_lands.stats",
        "lands_lands.level",
      ])
      .executeTakeFirst()

    return query ?? null;
  }

  const [main, members, details] = await Promise.all([
    getMain(), getMembers(), getDetails()
  ])

  if (!main) return null;

  return {
    ...main,
    members,
    details,
    chunks_amount: main.chunks_amount ?? 0,
    areas_amount: main.areas_amount ?? 0,
    stats: main.stats ? JSON.parse(main.stats) : null,
    area: isOwner ? JSON.parse(main.area as string) : null,
    spawn: isOwner ? main.spawn : null,
    balance: isOwner ? main.balance : 0,
    limits: isOwner ? main.limits ? JSON.parse(main.limits) : null : null,
  }
}

export const land = new Elysia()
  .use(sessionDerive())
  .use(userDerive())
  .get("/land/:id", async ({ nickname: initiator, ...ctx }) => {
    const id = ctx.params.id

    try {
      const data = await getLand({ id, initiator })

      ctx.set.headers["Cache-Control"] = "public, max-age=15, s-maxage=15"

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  })



type PlayerLands = {
  data: Array<Pick<Land, "ulid" | "name" | "title" | "created_at" | "type"> & {
    members: Array<{
      nickname: string,
      uuid: string,
      chunks: number
    }>
  }>,
  meta: { count: number }
}

const landsByNicknameSchema = t.Object({
  exclude: t.Optional(t.String())
})

type LandMember = {
  [key: string]: {
    chunks: number
  }
}

export const playerLands = new Elysia()
  .get("/lands/:nickname", async (ctx) => {
    const nickname = ctx.params.nickname
    const exclude = ctx.query.exclude;

    let data: PlayerLands = {
      data: [],
      meta: {
        count: 0
      }
    }

    try {
      let lands = await getLandsByNickname(nickname)

      if (!lands) return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: lands })

      if (exclude) {
        lands = lands.filter(land => land.ulid !== exclude)
      }

      data = {
        data: lands,
        meta: {
          count: lands.length
        }
      }

      return ctx.status(HttpStatusEnum.HTTP_200_OK, data)
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e));
    }
  }, { query: landsByNicknameSchema })

export async function getLandsByNickname(nickname: string) {
  const player = await bisquite
    .selectFrom("lands_players")
    .select("uuid")
    .where("name", "=", nickname)
    .executeTakeFirst()

  if (!player) return null;

  const lands = await bisquite
    .selectFrom("lands_lands")
    .select([
      "ulid",
      "name",
      "type",
      "members",
      "created_at",
      "title",
    ])
    .where("members", "like", `%${player.uuid}%`)
    .execute();

  if (!lands.length) return null;

  const allMemberUUIDs = new Set<string>();

  const parsedLands = lands.map((land) => {
    const members: LandMember = JSON.parse(land.members);

    Object.keys(members).forEach((uuid) => allMemberUUIDs.add(uuid));

    return { ...land, members };
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
      nickname: nicknameMap.get(uuid)!,
      chunks: data.chunks,
    })),
  }));
}



type Lands = Pick<Land, "ulid" | "title" | "name" | "level" | "created_at" | "type" | "stats"> & {
  members: {
    [key: string]: number
  }
}

const landsSchema = t.Object({
  cursor: t.Optional(t.String())
})

export const lands = new Elysia()
  .get("/lands", async (ctx) => {
    const cursor = ctx.query.cursor

    try {
      const lands = await getLands({ cursor })

      return ctx.status(HttpStatusEnum.HTTP_200_OK, lands)
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  }, { query: landsSchema })

async function getLands({ cursor }: Static<typeof landsSchema>) {
  const query = bisquite
    .selectFrom("lands_lands")
    .select([
      "ulid",
      "members",
      "title",
      "name",
      "level",
      "stats",
      "type",
      "created_at"
    ])

  const res = await executeWithCursorPagination(query, {
    perPage: 16,
    after: cursor,
    fields: [
      {
        key: "created_at", direction: "desc", expression: "created_at",
      }
    ],
    parseCursor: (cursor) => ({
      created_at: new Date(cursor.created_at)
    }),
  })

  const lands: Lands[] = res.rows.map(land => ({
    ...land,
    stats: land.stats ? JSON.parse(land.stats) : null,
    members: JSON.parse(land.members)
  }))

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