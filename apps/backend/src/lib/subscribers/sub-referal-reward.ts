import { getNatsConnection } from "#/shared/nats/nats-client"
import { USER_REFERAL_REWARD_SUBJECT } from "#/shared/nats/nats-subjects"
import { callServerCommand } from "#/utils/server/call-command"
import { natsLogger } from "@repo/lib/logger"

type ReferalRewardPayload = {
  referrer: string,
  referral: string
}

export const subscribeReferalReward = () => {
  const nc = getNatsConnection()

  console.log("Subscribed to referal reward")

  return nc.subscribe(USER_REFERAL_REWARD_SUBJECT, {
    callback: async (err, msg) => {
      if (err) {
        console.error(err);
        return;
      }

      const payload = msg.json<ReferalRewardPayload>()

      if (!payload) return;

      try {
        await Promise.all([
          callServerCommand({ parent: "cmi", value: `money give ${payload.referral} 50` }),
          callServerCommand({ parent: "p", value: `give ${payload.referrer} 1` })
        ])
      } catch (e) {
        console.error(e);
      }
    }
  })
}