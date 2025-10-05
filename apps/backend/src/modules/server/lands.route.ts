import Elysia from "elysia";
import { bisquite } from "#/shared/database/bisquite-db";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { executeWithCursorPagination } from "kysely-paginate";
import type { Land } from "@repo/shared/types/entities/land"
import { getStaticUrl } from "#/helpers/volume";
import { getDirection } from "#/utils/config/paginate";
import z from "zod/v4";
import { defineUser } from "#/lib/middlewares/define";

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
        banner: `${process.env.VOLUME_ENDPOINT}/banners/kingdom.png`,
        gallery: [getStaticUrl("arts/1.png"), getStaticUrl("arts/2.png"), getStaticUrl("arts/3.png")]
      }
    }

    return { banner: null, gallery: [] }
  }

  async function getMembers() {
    const query = bisquite
      .selectFrom('CMI_users')
      .select([
        'player_uuid as uuid',
        'username as nickname'
      ])
      .where('player_uuid', 'in', memberUUIDs)

    let members: Awaited<ReturnType<typeof query["execute"]>> = [];

    if (memberUUIDs.length > 0) {
      members = await query.execute()
    }

    const isMember = members.some(member => member.nickname === initiator)

    if (initiator && isMember) {
      isOwner = true
    }

    const data = members.map((member, idx) => ({
      uuid: member.uuid as string,
      nickname: member.nickname as string,
      chunks: 0,
      // 4 type = owner
      // 1 type = member
      role: idx === 0 ? 4 : 1
    }))

    return data
  }

  async function getMain() {
    let OWNER_FIELDS: string[] = [];

    if (isOwner) {
      OWNER_FIELDS = [
        "lands_lands.balance",
        "lands_lands.limits",
        "lands_lands.spawn"
      ]
    }

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

    const data = query ?? null;

    return data
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
  .use(defineUser())
  .get("/land/:id", async ({ nickname: initiator, set, status, ...ctx }) => {
    const id = ctx.params.id

    const data = await getLand({ id, initiator })

    set.headers["Cache-Control"] = "public, max-age=15, s-maxage=15"

    return status(HttpStatusEnum.HTTP_200_OK, { data })
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

const landsByNicknameSchema = z.object({
  exclude: z.string().optional()
})

type LandMember = {
  [key: string]: {
    chunks: number
  }
}

export const playerLands = new Elysia()
  .get("/lands/:nickname", async ({ status, ...ctx }) => {
    const nickname = ctx.params.nickname
    const exclude = ctx.query.exclude;

    let data: PlayerLands = {
      data: [],
      meta: {
        count: 0
      }
    }

    let lands = await getLandsByNickname(nickname)

    if (!lands) {
      return status(HttpStatusEnum.HTTP_200_OK, { data: lands })
    }

    if (exclude) {
      lands = lands.filter(land => land.ulid !== exclude)
    }

    data = {
      data: lands,
      meta: {
        count: lands.length
      }
    }

    return status(HttpStatusEnum.HTTP_200_OK, data)
  }, {
    query: landsByNicknameSchema
  })

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

const landsSchema = z.object({
  cursor: z.string().optional()
})

export const lands = new Elysia()
  .get("/lands", async ({ status, ...ctx }) => {
    const { cursor } = ctx.query

    const lands = await getLands({ cursor })

    return status(HttpStatusEnum.HTTP_200_OK, { data: lands })
  }, { 
    query: landsSchema 
  })

async function getLands({ cursor }: z.infer<typeof landsSchema>) {
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

  const direction = getDirection(false)

  const res = await executeWithCursorPagination(query, {
    perPage: 16,
    after: cursor,
    fields: [
      { key: "created_at", direction, expression: "created_at" }
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