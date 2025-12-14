import Elysia, { t } from "elysia";
import { defineOptionalUser } from "#/lib/middlewares/define";
import { bisquite } from "#/shared/database/bisquite-db";
import type { Land } from "@repo/shared/types/entities/land";
import { landHelpers } from "#/utils/lands/lands-helpers";

const { transformBanner, transformGallery } = landHelpers

async function getLand(
  ulid: string,
  { initiator }: { initiator: string | null }
): Promise<Land | null> {
  let isOwner = false;

  const landRow = await bisquite
    .selectFrom('lands_lands')
    .select(['members', "name"])
    .where('ulid', '=', ulid)
    .executeTakeFirstOrThrow();

  const membersObject = JSON.parse(landRow.members ?? '{}');
  const memberUUIDs = Object.keys(membersObject);

  const [bannerResult, galleryResult] = await Promise.all([
    bisquite
      .selectFrom("lands_banners")
      .select('banner_url as banner')
      .where("ulid", "=", ulid)
      .executeTakeFirst(),
    bisquite
      .selectFrom('lands_gallery')
      .select('url')
      .where('ulid', '=', ulid)
      .execute()
  ])
  
  const details = { 
    banner: transformBanner(bannerResult?.banner), 
    gallery: transformGallery(galleryResult)
  }

  async function getMembers() {
    if (memberUUIDs.length === 0) return [];

    const members = await bisquite
      .selectFrom('cmi_users')
      .select([
        'player_uuid as uuid',
        'username as nickname'
      ])
      .where('player_uuid', 'in', memberUUIDs)
      .execute()

    const isMember = members.some(m => m.nickname === initiator)

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
      // OWNER_FIELDS
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
      .where("lands_lands.ulid", "=", ulid)
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

  const [main, members] = await Promise.all([
    getMain(), getMembers()
  ])

  if (!main || !members) return null;

  const result = {
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

  return result
}

const landPayload = t.Object({
  ulid: t.String(),
  name: t.String(),
  area: t.Union([
    t.Object({
      ulid: t.String(),
      holder: t.Object({
        roles: t.Array(t.Unknown()),
        trusted: t.Array(t.String()),
      }),
      settings: t.Array(t.String()),
      invites: t.Array(t.Unknown()),
      tax: t.Object({
        current: t.Number(),
        time: t.Number(),
        before: t.Number(),
      }),
      banned: t.Array(t.Unknown()),
    }),
    t.Null()
  ]),
  type: t.String(),
  created_at: t.Date(),
  title: t.Nullable(t.String()),
  chunks_amount: t.Nullable(t.Number()),
  areas_amount: t.Nullable(t.Number()),
  balance: t.Number(),
  stats: t.Object({
    kills: t.Number(),
    deaths: t.Number(),
    wins: t.Number(),
    defeats: t.Number(),
    captures: t.Number()
  }),
  level: t.Number(),
  limits: t.Union([
    t.Array(t.String()), t.Null()
  ]),
  members: t.Array(
    t.Object({
      nickname: t.String(),
      uuid: t.String(),
      role: t.Number()
    })
  ),
  spawn: t.Nullable(t.String()),
  details: t.Object({
    banner: t.Nullable(t.String()),
    gallery: t.Array(t.String())
  })
})

export const landsSolo = new Elysia()
  .use(defineOptionalUser())
  // .model({
  //   "land-by-id": withData(
  //     t.Nullable(landPayload)
  //   )
  // })
  .get("/:id", async ({ nickname: initiator, params, set }) => {
    const ulid = params.id
    const data = await getLand(ulid, { initiator })

    set.headers["Cache-Control"] = "public, max-age=15, s-maxage=15"
    set.headers["vary"] = "Origin";

    return { data }
  }, {
    // response: {
    //   200: "land-by-id"
    // }
  })