import { abortablePromiseAll } from "#/helpers/abortable";
import { general } from "#/shared/database/general-db";
import { getNats } from "#/shared/nats/client";
import { logErrorMsg } from "#/utils/config/log-utils";
import { logger } from "#/utils/config/logger";
import { callServerCommand } from "#/utils/server/call-command";
import { validateReferal } from "#/utils/server/validate-referal";
import type { Msg } from "@nats-io/nats-core";

async function handleReferalCheck(msg: Msg) {
  const nickname: string = new TextDecoder().decode(msg.data)
  if (!nickname) return;

  try {
    const result = await validateReferal(nickname)
    if (!result) return;

    const controller = new AbortController()

    await general.transaction().execute(async (trx) => {
      await abortablePromiseAll([
        // for initiator
        () => callServerCommand({ parent: "cmi", value: `money give ${result.initiator} 60` }),
        () => callServerCommand({ parent: "p", value: `give ${result.initiator} 5` }),

        // for recipient
        () => callServerCommand({ parent: "cmi", value: `money give ${result.recipient} 30` }),
        () => callServerCommand({ parent: "p", value: `give ${result.recipient} 1` })
      ], controller)

      const update = await trx
        .updateTable("referrals")
        .set({ completed: true })
        .where(eb =>
          eb.and([
            eb("referrer", "=", result.initiator),
            eb("referral", "=", result.recipient)
          ])
        )
        .executeTakeFirstOrThrow()

      logger.log(update.numUpdatedRows > 0 ? "updated" : "not updated")
    })
  } catch (e) {
    logErrorMsg(e)
  }
}

export const subscribeRefferalCheck = (subject: string) => {
  const nc = getNats()

  const subscription = nc.subscribe(subject, {
    callback: (e, msg) => {
      if (e) return logErrorMsg(e)

      void handleReferalCheck(msg)
    }
  })

  return subscription
}