import { Subscription } from "@nats-io/nats-core"
import { initNats, natsLogger } from "./client"
import { subscribeGiveBalance } from "#/lib/subscribers/sub-give-balance"
import { subscribePlayerJoin } from "#/lib/subscribers/sub-player-join"
import { subscribePlayerStats } from "#/lib/subscribers/sub-player-stats"
import { subscribeRefferalCheck } from "#/lib/subscribers/sub-referal-check"
import { subscribeReferalReward } from "#/lib/subscribers/sub-referal-reward"

const SUBCRIBERS: Record<string, () => Subscription> = {
  "subscribeRefferalCheck": subscribeRefferalCheck,
  "subscribePlayerJoin": subscribePlayerJoin,
  "subscribeReferalReward": subscribeReferalReward,
  "subscribeGiveBalance": subscribeGiveBalance,
  "subscribePlayerStats": subscribePlayerStats
}

export async function startNats() {
  await initNats()

  for (const [name, fn] of Object.entries(SUBCRIBERS)) {
    fn()
    natsLogger.log(`Subscribed to ${name}`)
  }
}