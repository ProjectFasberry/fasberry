import { defineUser } from "#/lib/middlewares/define"
import { general } from "#/shared/database/general-db"
import Elysia from "elysia"

async function getReferals(nickname: string) {
  const query = await general
    .selectFrom("referrals")
    .select([
      "id", 
      "created_at", 
      "completed", 
      "referral"
    ])
    .where("referrer", "=", nickname)
    .execute()

  return query ?? null;
}

const referralsList = new Elysia()
  .use(defineUser())
  .get("/list", async ({ nickname }) => {
    const data = await getReferals(nickname)
    return { data }
  })

export const referrals = new Elysia()
  .group("/referrals", app => app
    .use(referralsList)
  )