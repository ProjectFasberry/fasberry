
// test min playtime = 5 minutes
// const TEST_MIN_PLAYTIME = 5 * 60 * 1000

import { bisquite } from "#/shared/database/bisquite-db";
import { sqlite } from "#/shared/database/sqlite-db";

// min playtime for reward //

// 3 hours
const MIN_PLAYTIME_FOR_RECIPIENT = 3 * 60 * 60 * 1000
// 6 hours
const MIN_PLAYTIME_FOR_INITIATOR = 6 * 60 * 60 * 1000

export async function validateReferal(nickname: string) {
  const queryRefferals = await sqlite
    .selectFrom("referrals")
    .selectAll()
    .where(eb =>
      eb.or([
        eb("initiator", "=", nickname),
        eb("recipient", "=", nickname)
      ])
    )
    .where("completed", "=", 0)
    .executeTakeFirst()

  if (!queryRefferals) return null;

  const queryPlaytime = await bisquite
    .selectFrom("CMI_users")
    .select(["TotalPlayTime", "username"])
    .where(eb =>
      eb.or([
        eb("username", "=", queryRefferals.recipient),
        eb("username", "=", queryRefferals.initiator)
      ])
    )
    .execute()

  if (!queryPlaytime || queryPlaytime.length < 2) {
    return null;
  }

  const initiatorPlaytime = queryPlaytime.find(
    p => p.username === queryRefferals.initiator
  )

  const recipientPlaytime = queryPlaytime.find(
    p => p.username === queryRefferals.recipient
  )

  if (!initiatorPlaytime?.TotalPlayTime || !recipientPlaytime?.TotalPlayTime) {
    return null;
  }

  let isPlaytimeValid: boolean = false;

  if (initiatorPlaytime.TotalPlayTime > MIN_PLAYTIME_FOR_INITIATOR) {
    if (recipientPlaytime.TotalPlayTime > MIN_PLAYTIME_FOR_RECIPIENT) {
      isPlaytimeValid = true;
    }
  }

  console.log(`playtime for ${queryRefferals.initiator} and ${queryRefferals.recipient} is ${isPlaytimeValid}`)

  if (!isPlaytimeValid) return null;

  return { initiator: queryRefferals.initiator, recipient: queryRefferals.recipient }
}