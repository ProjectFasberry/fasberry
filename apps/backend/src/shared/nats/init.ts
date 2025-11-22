import { Subscription } from "@nats-io/nats-core"
import { getNats, initNats, natsLogger } from "./client"
import { subscribeGiveBalance } from "#/lib/subscribers/sub-give-balance"
import { subscribePlayerJoin } from "#/lib/subscribers/sub-player-join"
import { subscribePlayerStats } from "#/lib/subscribers/sub-player-stats"
import { subscribeRefferalCheck } from "#/lib/subscribers/sub-referal-check"
import { subscribeReferalReward } from "#/lib/subscribers/sub-referal-reward"
import { ConsumerInfo, jetstream, jetstreamManager } from "@nats-io/jetstream"

const SUBCRIBERS: Record<string, () => Subscription> = {
  "subscribeRefferalCheck": subscribeRefferalCheck,
  "subscribePlayerJoin": subscribePlayerJoin,
  "subscribeReferalReward": subscribeReferalReward,
  "subscribeGiveBalance": subscribeGiveBalance,
  "subscribePlayerStats": subscribePlayerStats
}

export const CONSUMERS: Record<string, Pick<ConsumerInfo, "name" | "stream_name">[]> = {
  "order": [
    { stream_name: "events", name: "a" }
  ]
}

const STREAMS = [
  { name: "events", subjects: ["order"] }
]

export async function startNats() {
  await initNats()

  for (const [name, fn] of Object.entries(SUBCRIBERS)) {
    fn()
    natsLogger.log(`Subscribed to ${name}`)
  }

  const nc = getNats();

  const js = jetstream(nc);
  const jsm = await jetstreamManager(nc);

  for (const { name, subjects } of STREAMS) {
    try {
      await jsm.streams.add({ name, subjects });
      natsLogger.log(`Stream ${name} with ${subjects.map((d => d)).join(',')} added`)
    } catch (e) {
      natsLogger.log(`Stream ${name} with ${subjects.map((d => d)).join(',')} exists`)
    }
  }

  for (const { name, stream_name } of Object.entries(CONSUMERS).flatMap(([_, arr]) => arr)) {
    try {
      const ec = await js.consumers.get(stream_name, name)
      natsLogger.log(`Consumer ${name} exists `)
    } catch (e) {
      const c = await jsm.consumers.add(stream_name, { name })
      natsLogger.log(`Consumer ${name} added`)
    }
  }
}