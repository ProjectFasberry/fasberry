import Elysia from "elysia";
import { getStaticUrl } from "#/helpers/volume";
import { defineUser } from "#/lib/middlewares/define";
import { bisquite } from "#/shared/database/bisquite-db";
import { VOLUME_ENDPOINT } from "#/shared/env";
import { Land } from "@repo/shared/types/entities/land";
import { HttpStatusEnum } from "elysia-http-status-code/status";

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
        banner: `${VOLUME_ENDPOINT}/banners/kingdom.png`,
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

export const landsSolo = new Elysia()
  .use(defineUser())
  .get("/:id", async ({ nickname: initiator, params, set, status }) => {
    const id = params.id
    const data = await getLand({ id, initiator })

    set.headers["Cache-Control"] = "public, max-age=15, s-maxage=15"

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  })