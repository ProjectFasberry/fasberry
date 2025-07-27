import { throwError } from "#/helpers/throw-error";
import { userDerive } from "#/lib/middlewares/user";
import { bisquite } from "#/shared/database/bisquite-db";
import { playerpoints } from "#/shared/database/playerpoints-db";
import { reputation } from "#/shared/database/reputation-db";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";

async function getBelkoin(nickname: string) {
  return playerpoints
    .selectFrom("playerpoints_username_cache")
    .innerJoin("playerpoints_points", "playerpoints_points.uuid", "playerpoints_username_cache.uuid")
    .select("playerpoints_points.points")
    .where("playerpoints_username_cache.username", "=", nickname)
    .executeTakeFirst()
}

async function getCharism(nickname: string) {
  return bisquite
    .selectFrom("CMI_users")
    .select("Balance")
    .where("username", "=", nickname)
    .executeTakeFirst()
}

async function getUserBalance(nickname: string) {
  const [belkoin, charism] = await Promise.all([
    getBelkoin(nickname),
    getCharism(nickname)
  ])

  return {
    charism: charism?.Balance ? charism?.Balance.toFixed(1) : 0,
    belkoin: belkoin?.points?.toFixed(1) ?? 0
  }
}

export const playerBalance = new Elysia()
  .use(userDerive())
  .get("/player-balance", async ({ nickname, ...ctx }) => {
    if (!nickname) {
      return ctx.status(HttpStatusEnum.HTTP_400_BAD_REQUEST)
    }

    try {
      const balance = await getUserBalance(nickname)

      if (!balance) {
        return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: { charism: 0, belkoin: 0 } })
      }

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: balance })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  })

async function getSkills(nickname: string) {
  const query = await bisquite
    // @ts-expect-error
    .selectFrom("ADAPT_DATA")
    // @ts-expect-error
    .innerJoin("Players", "Players.UUID", "ADAPT_DATA.UUID")
    .select([
      "ADAPT_DATA.DATA"
    ])
    .where("Players.Name", "=", nickname)
    .executeTakeFirst()

  return query ?? null;
}

type Skill = {
  line: string;
  xp: number;
  lastXP: number;
  knowledge: number;
  multiplier: number;
  freshness: number;
  rfreshness: number;
  lastLevel: number;
  last: number;
  storage: Record<string, unknown>;
  adaptations: Record<string, unknown>;
  multipliers: unknown[];
};

type SkillsData = {
  skillLines: {
    discovery: Skill,
    agility: Skill,
    rift: Skill,
    architect: Skill,
    seaborne: Skill,
    stealth: Skill,
    axes: Skill,
    herbalism: Skill,
    hunter: Skill,
    pickaxe: Skill,
    swords: Skill,
    ranged: Skill,
    tragoul: Skill,
    excavation: Skill,
    unarmed: Skill
  };
  stats: {
    move: number,
    "minutes.online": number,
    "move.sprint": number,
    "move.sneak": number,
    "blocks.placed": number,
    "blocks.placed.value": number,
    "move.swim": number,
    "move.fly": number,
    "blocks.broken": number,
    "axes.blocks.broken": number,
    "axes.blocks.value": number,
    "food.eaten": number,
    "harvest.blocks": number,
    "killed.kills": number,
    "pickaxe.blocks.broken": number,
    "pickaxe.blocks.value": number,
    "sword.hits": number,
    "sword.damage": number,
    "ranged.shotsfired": number,
    "ranged.shotsfired.arrow": number,
    "ranged.distance": number,
    "ranged.distance.arrow": number,
    "ranged.damage": number,
    "ranged.damage.arrow": number,
    "trag.hitsrecieved": number,
    "trag.damage": number,
    "excavation.blocks.broken": number,
    "excavation.blocks.value": number,
    "axes.damage": number,
    "axes.swings": number,
    "unarmed.hist": number,
    "unarmed.damage": number,
  }
  last: "none",
  advancements: Array<string>,
  seenMobs: {
    seen: Array<string>
  },
  seenFoods: {
    seen: Array<string>
  },
  seenItems: {
    seen: Array<string>
  },
  seenRecipes: {
    seen: Array<string>
  },
  seenWorlds: {
    seen: Array<string>
  },
  seenPeople: {
    seen: Array<string>
  },
  seenEnvironments: {
    seen: Array<string>
  },
  seenPotionEffects: {
    seen: Array<string>
  },
  seenBlocks: {
    seen: Array<string>
  },
  multipliers: unknown[],
  wisdom: number,
  multiplier: number,
  lastLogin: number,
  masterXp: number,
  lastMasterXp: number
};

export const playerSkills = new Elysia()
  .get("/player-skills/:nickname", async (ctx) => {
    const nickname = ctx.params.nickname

    try {
      let skills = await getSkills(nickname)

      if (!skills) {
        return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: null })
      }

      const data = JSON.parse(skills.DATA) as SkillsData

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  })

type PlayerStats = {
  charism: number
  belkoin: number
  reputation: number,
  meta: string | null,
  displayName: string | null,
  totalPlaytime: number
}

async function getPlayerStats(nickname: string): Promise<PlayerStats> {
  const main = await bisquite
    .selectFrom("CMI_users")
    .leftJoin("playerpoints_username_cache", "CMI_users.username", "playerpoints_username_cache.username")
    .leftJoin("playerpoints_points", "playerpoints_points.uuid", "playerpoints_username_cache.uuid")
    .select([
      "CMI_users.Balance",
      "CMI_users.UserMeta",
      "playerpoints_points.points",
      "CMI_users.player_uuid",
      "CMI_users.TotalPlayTime",
      "CMI_users.DisplayName"
    ])
    .where("CMI_users.username", "=", nickname)
    .executeTakeFirst()

  if (!main) {
    return {
      charism: 0, meta: null, belkoin: 0, reputation: 0, displayName: null, totalPlaytime: 0
    }
  }

  const result = await reputation
    .selectFrom("reputation")
    .select("reputation")
    .where("reputation.uuid", "=", main.player_uuid)
    .executeTakeFirst()

  return {
    charism: main.Balance ? Number(main.Balance.toFixed(2)) : 0,
    meta: main.UserMeta,
    belkoin: main.points ? Number(main.points.toFixed(2)) : 0,
    reputation: result?.reputation ? result.reputation : 0,
    displayName: main.DisplayName,
    totalPlaytime: main.TotalPlayTime ?? 0
  }
}

export const playerStats = new Elysia()
  .get("/player-stats/:nickname", async (ctx) => {
    const nickname = ctx.params.nickname

    try {
      const stats = await getPlayerStats(nickname)

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: stats })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  })