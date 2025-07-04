import { PaymentMeta, publishPaymentNotify } from "#/lib/publishers/pub-payment-notify";
import { callBroadcast } from "../server/call-broadcast";
import { callServerCommand } from "../server/call-command";
import { setPlayerGroup } from "../server/set-player-group";
import { DONATE_TITLE } from "@repo/shared/constants/donate-aliases";
import { sqlite } from "#/shared/database/sqlite-db";

type CreateErrorLog = { type: string, description: string, initiator: string, recipient: string }

export async function createErrorLog({
  description, initiator, recipient, type
}: CreateErrorLog) {
  return sqlite
    .insertInto("errors_logs")
    .values({
      type, description, initiator, recipient
    })
    .returningAll()
    .executeTakeFirst();
}

export async function processDonatePayment({
  nickname, paymentType, paymentValue
}: PaymentMeta) {
  const r = await setPlayerGroup(nickname, `group.${paymentValue}`)

  // if invalid update a group
  if (!r) {
    await createErrorLog({
      description: `Invalid group ${paymentValue} for nickname ${nickname}`,
      initiator: "logger",
      recipient: nickname,
      type: "payment"
    })

    return;
  }

  publishPaymentNotify({ nickname, paymentType, paymentValue })

  const message = `Игрок ${nickname} приобрел привилегию ${DONATE_TITLE[paymentValue as keyof typeof DONATE_TITLE]}`

  await Promise.all([
    callServerCommand({ parent: "cmi", value: `toast ${nickname} Поздравляем с покупкой!` }),
    callBroadcast(message)
  ])
}