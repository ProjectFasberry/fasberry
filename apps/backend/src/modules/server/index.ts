import { achievements, achievementsMeta } from "#/modules/server/achievements.route";
import { favoriteItem } from "#/modules/server/favorite-item.route";
import { userGameStatus } from "#/modules/server/game-status.route";
import { land, lands, playerLands } from "#/modules/server/lands.route";
import { userLocation } from "#/modules/server/location.route";
import { minecraftItems } from "#/modules/server/minecraft-items.route";
import { playerBalance, playerSkills, playerStats } from "#/modules/server/player.route";
import { ratingBy } from "#/modules/server/rating.route";
import { skinGroup } from "#/modules/server/skin.route";
import { status } from "#/modules/server/status.route";
import { user } from "#/modules/user/user.route";
import Elysia from "elysia";

export const server = new Elysia()
  .group("/server", app =>
    app
      .use(favoriteItem)
      .use(userLocation)
      .use(minecraftItems)
      .use(skinGroup)
      .use(playerStats)
      .use(playerSkills)
      .use(playerBalance)
      .use(ratingBy)
      .use(land)
      .use(lands)
      .use(playerLands)
      .use(achievementsMeta)
      .use(achievements)
      .use(userGameStatus)
      .use(status)
      .use(user)
  )