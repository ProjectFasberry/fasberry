import { bisquite } from "#/shared/database/bisquite-db";

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

  if (!player) return [];

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

  if (!lands.length) return [];

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
