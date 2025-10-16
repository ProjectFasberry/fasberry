import { abortablePromiseAll } from "#/helpers/abortable"
import { getNats } from "#/shared/nats/client"
import { USER_REFERAL_REWARD_SUBJECT } from "#/shared/nats/subjects"
import { logError } from "#/utils/config/logger"
import { callServerCommand } from "#/utils/server/call-command"
import { Msg } from "@nats-io/nats-core"

type ReferalRewardPayload = {
  referrer: string,
  referral: string
}

async function handleReferalReward(msg: Msg) {
  const payload = msg.json<ReferalRewardPayload>()
  if (!payload) return;

  const controller = new AbortController()

  try {
    await abortablePromiseAll([
      (signal) => callServerCommand({ parent: "cmi", value: `money give ${payload.referral} 50` }, { signal }),
      (signal) => callServerCommand({ parent: "p", value: `give ${payload.referrer} 1` }, { signal })
    ], controller)
  } catch (e) {
    logError(e)
  }
}

export const subscribeReferalReward = () => {
  const nc = getNats()

  const subscription = nc.subscribe(USER_REFERAL_REWARD_SUBJECT, {
    callback: (e, msg) => {
      if (e) return logError(e)

      void handleReferalReward(msg)
    }
  })

  return subscription
}