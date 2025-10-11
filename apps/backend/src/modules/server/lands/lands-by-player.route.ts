import { bisquite } from "#/shared/database/bisquite-db"
import { PlayerLands, PlayerLandsPayload } from "@repo/shared/types/entities/land"
import Elysia from "elysia"
import { HttpStatusEnum } from "elysia-http-status-code/status"
import z from "zod"

const landsByNicknameSchema = z.object({
  exclude: z.string().optional()
})

type LandMember = {
  [key: string]: {
    chunks: number
  }
}

export const landsByPlayer = new Elysia()
  .get("/list/:nickname", async ({ status, ...ctx }) => {
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

    const payload: PlayerLandsPayload = { data }

    return status(HttpStatusEnum.HTTP_200_OK, payload)
  }, {
    query: landsByNicknameSchema
  })

async function getLandsByNickname(nickname: string) {
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
