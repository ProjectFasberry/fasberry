import { abortablePromiseAll } from "#/helpers/abortable"
import { getNatsConnection } from "#/shared/nats/nats-client"
import { USER_REFERAL_REWARD_SUBJECT } from "#/shared/nats/nats-subjects"
import { logger } from "#/utils/config/logger"
import { callServerCommand } from "#/utils/server/call-command"

type ReferalRewardPayload = {
  referrer: string,
  referral: string
}

export const subscribeReferalReward = () => {
  const nc = getNatsConnection()

  logger.success("Subscribed to referal reward")

  return nc.subscribe(USER_REFERAL_REWARD_SUBJECT, {
    callback: async (e, msg) => {
      if (e) {
        logger.error(e.message);
        return;
      }

      const payload = msg.json<ReferalRewardPayload>()
      if (!payload) return;

      const controller = new AbortController()

      try {
        await abortablePromiseAll([
          (signal) => callServerCommand({ parent: "cmi", value: `money give ${payload.referral} 50` }, { signal }),
          (signal) => callServerCommand({ parent: "p", value: `give ${payload.referrer} 1` }, { signal })
        ], controller)
      } catch (e) {
        logger.error(e);
      }
    }
  })
}