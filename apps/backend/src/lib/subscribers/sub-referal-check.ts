import { abortablePromiseAll } from "#/helpers/abortable";
import { sqlite } from "#/shared/database/sqlite-db";
import { getNatsConnection } from "#/shared/nats/nats-client";
import { USER_REFERAL_CHECK_SUBJECT } from "#/shared/nats/nats-subjects";
import { logger } from "#/utils/config/logger";
import { callServerCommand } from "#/utils/server/call-command";
import { validateReferal } from "#/utils/server/validate-referal";

export const subscribeRefferalCheck = () => {
  const nc = getNatsConnection()

  logger.success("Subscribed to refferal check")

  return nc.subscribe(USER_REFERAL_CHECK_SUBJECT, {
    callback: async (e, msg) => {
      if (e) {
        logger.error(e);
        return;
      }

      const nickname: string = new TextDecoder().decode(msg.data)
      if (!nickname) return;

      try {
        const result = await validateReferal(nickname)
        if (!result) return;

        const controller = new AbortController()

        await sqlite.transaction().execute(async (trx) => {
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
            .set({ completed: 1 })
            .where(eb =>
              eb.and([
                eb("initiator", "=", result.initiator),
                eb("recipient", "=", result.recipient)
              ])
            )
            .executeTakeFirstOrThrow()

          logger.log(update.numUpdatedRows > 0 ? "updated" : "not updated")
        })
      } catch (e) {
        logger.error(e)
      }
    }
  })
}