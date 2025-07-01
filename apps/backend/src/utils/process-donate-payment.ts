import { PaymentMeta, publishPaymentNotify } from "#/lib/publishers/pub-payment-notify";
import { callBroadcast } from "./call-broadcast";
import { callServerCommand } from "./call-command";
import { createErrorLog } from "./create-error-log";
import { DONATE_TITLE } from "./donate-aliases";
import { setPlayerGroup } from "./set-player-group";

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