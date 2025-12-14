import { bisquite } from "#/shared/database/bisquite-db";
import { safeJsonParse } from "#/utils/config/transforms";
import { landHelpers } from "#/utils/lands/lands-helpers";
import { getPlayerUUID } from "#/utils/player/uuid";

type LandMember = Record<string, { chunks: number }>

const { getLandsUrl } = landHelpers

export async function getLandsByNickname(nickname: string) {
  const uuid = await getPlayerUUID(nickname)

  const lands = await bisquite
    .selectFrom("lands_lands")
    .select([
      "lands_lands.ulid",
      "lands_lands.name",
      "lands_lands.type",
      "lands_lands.members",
      "lands_lands.created_at",
      "lands_lands.title",
    ])
    .where("members", "like", `%${uuid}%`)
    .execute();

  if (!lands.length) return [];

  const ulids = lands.map(l => l.ulid)

  const [bannerRows, galleryRows] = await Promise.all([
    bisquite
      .selectFrom("lands_banners")
      .select([
        'banner_url',
        'ulid'
      ])
      .where("ulid", "in", ulids)
      .execute(),
    bisquite
      .selectFrom('lands_gallery')
      .select([
        'url',
        'ulid'
      ])
      .where('ulid', 'in', ulids)
      .execute()
  ])

  const detailsMap: Map<string, { banner: string | null, gallery: string[] }> = new Map()

  for (const id of ulids) {
    detailsMap.set(id, { banner: null, gallery: [] })
  }

  for (const row of bannerRows) {
    const target = detailsMap.get(row.ulid);

    if (target) {
      target.banner = getLandsUrl(row.banner_url)
    }
  }

  for (const row of galleryRows) {
    const target = detailsMap.get(row.ulid)

    if (target) {
      target.gallery.push(getLandsUrl(row.url))
    }
  }

  const allMemberUUIDs: Set<string> = new Set();

  const parsedLands = lands.map(l => {
    const parsed = safeJsonParse<LandMember>(l.members)
    if (!parsed.ok) throw parsed.error

    const members = parsed.value

    for (const uid in members) {
      allMemberUUIDs.add(uid)
    }

    return { ...l, members }
  })

  const membersList = await bisquite
    .selectFrom("lands_players")
    .select([
      "uuid",
      "name"
    ])
    .where("uuid", "in", [...allMemberUUIDs])
    .execute();

  const nameMap = new Map(membersList.map(m => [m.uuid, m.name]))

  return parsedLands.map(land => {
    const members = Object.entries(land.members).map(([uuid, data]) => ({
      uuid,
      nickname: nameMap.get(uuid)!,
      chunks: data.chunks,
    }))

    return {
      ...land,
      members,
      details: detailsMap.get(land.ulid)!,
    }
  })
}