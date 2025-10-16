import Elysia from "elysia";
import { minecraftItems } from "#/modules/server/favorite-item/minecraft-items.route";
import { ratingList } from "#/modules/server/rating";
import { status } from "#/modules/server/status";
import { events } from "#/modules/server/events";
import { lands } from "#/modules/server/lands";
import { playerGroup } from "./player";
import { tasks } from "./tasks";

const globalGroup = new Elysia()
  .group("", app => app
    .use(ratingList)
    .use(lands)
    .use(status)
    .use(events)
    .use(minecraftItems)
    .use(tasks)
  )

export const server = new Elysia()
  .group("/server", app => app
    .use(globalGroup)
    .use(playerGroup)
  )