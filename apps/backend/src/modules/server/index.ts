import Elysia from "elysia";
import { minecraftItems } from "#/modules/server/favorite-item/minecraft-items.route";
import { ratingList } from "#/modules/server/rating";
import { status } from "#/modules/server/status";
import { events } from "#/modules/server/events";
import { lands } from "#/modules/server/lands";
import { playerGroup } from "./player";
import { tasks } from "./tasks";
import { validateBannedStatus } from "#/lib/middlewares/validators";
import { skin } from "./skin";
import { general } from "#/shared/database/main-db";
import { defineUser } from "#/lib/middlewares/define";

const referralsList = new Elysia()
  .use(defineUser())
  .get("/list", async ({ nickname }) => {
    const data = await general
      .selectFrom("referrals")
      .select(["id", "created_at", "completed", "referral"])
      .where("referrer", "=", nickname)
      .execute()

    return { data }
  })

const referrals = new Elysia()
  .group("/referrals", app => app
    .use(referralsList)
  )

const publicServerGroup = new Elysia()
  .group("", app => app
    .use(ratingList)
    .use(lands)
    .use(status)
    .use(events)
    .use(minecraftItems)
    .use(tasks)
    .use(skin)
    .use(referrals)
  )

const privatedServerGroup = new Elysia()
  .use(validateBannedStatus())
  .group("", app => app
    .use(playerGroup)
  )

export const serverGroup = new Elysia()
  .group("/server", app => app
    .use(publicServerGroup)
    .use(privatedServerGroup)
  )