import { abortablePromiseAll } from "#/helpers/abortable";
import { general } from "#/shared/database/main-db";
import { getNats } from "#/shared/nats/client";
import { USER_REFERAL_CHECK_SUBJECT } from "#/shared/nats/subjects";
import { logError, logger } from "#/utils/config/logger";
import { callServerCommand } from "#/utils/server/call-command";
import { validateReferal } from "#/utils/server/validate-referal";
import { Msg } from "@nats-io/nats-core";

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
        (signal) => callServerCommand({ parent: "cmi", value: `money give ${result.initiator} 60` }, { signal }),
        (signal) => callServerCommand({ parent: "p", value: `give ${result.initiator} 5` }, { signal }),

        // for recipient
        (signal) => callServerCommand({ parent: "cmi", value: `money give ${result.recipient} 30` }, { signal }),
        (signal) => callServerCommand({ parent: "p", value: `give ${result.recipient} 1` }, { signal })
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
    logError(e)
  }
}

export const subscribeRefferalCheck = () => {
  const nc = getNats()

  const subscription = nc.subscribe(USER_REFERAL_CHECK_SUBJECT, {
    callback:  (e, msg) => {
      if (e) return logError(e)

      void handleReferalCheck(msg)
    }
  })

  return subscription
}