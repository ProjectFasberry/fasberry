import Elysia from "elysia";
import { favoriteItem } from "#/modules/server/favorite-item.route";
import { playerLocation } from "#/modules/server/location.route";
import { minecraftItems } from "#/modules/server/minecraft-items.route";
import { playerBalance, playerSkills, playerStats } from "#/modules/server/player.route";
import { ratingBy } from "#/modules/server/rating.route";
import { playerSkin } from "#/modules/server/skin";
import { status } from "#/modules/server/status.route";
import { player } from "#/modules/user/player.route";
import { events } from "./events";
import { lands } from "./lands";
import { playerAchievements } from "./achievements";
import { playerActivity } from "./activity";
import { seemsPlayers } from "../user/seems-players.route";
import { balance } from "../user/balance.route";

const playerGroup = new Elysia()
  .group("", app => app
    .use(player)
    .use(playerStats)
    .use(playerSkills)
    .use(playerBalance)
    .use(playerSkin)
    .use(playerActivity)
    .use(playerAchievements)
    .use(playerLocation)
    .use(favoriteItem)
    .use(seemsPlayers)
    .use(balance)
  )

const globalGroup = new Elysia()
  .group("", app => app
    .use(ratingBy)
    .use(lands)
    .use(status)
    .use(events)
    .use(minecraftItems)
  )

export const server = new Elysia()
  .group("/server", app => app
    .use(globalGroup)
    .use(playerGroup)
  )