import { PaymentMeta, publishPaymentNotify } from "#/lib/publishers/pub-payment-notify";
import { callBroadcast } from "../server/call-broadcast";
import { callServerCommand } from "../server/call-command";
import { setPlayerGroup } from "../server/set-player-group";
import { DONATE_TITLE } from "@repo/shared/constants/donate-aliases";
import { abortablePromiseAll } from "#/helpers/abortable";
import { logger } from "@repo/lib/logger";

export async function processDonatePayment({
  nickname, paymentType, paymentValue
}: PaymentMeta) {
  const r = await setPlayerGroup(nickname, `group.${paymentValue}`)

  // if invalid update a group
  if (!r) {
    logger.error(`Payment: Invalid group ${paymentValue} for nickname ${nickname}`)

    return;
  }

  publishPaymentNotify({ nickname, paymentType, paymentValue })

  const message = `Игрок ${nickname} приобрел привилегию ${DONATE_TITLE[paymentValue as keyof typeof DONATE_TITLE]}`

  await abortablePromiseAll([
    (signal) => callServerCommand({ parent: "cmi", value: `toast ${nickname} Поздравляем с покупкой!` }, { signal }),
    (signal) => callBroadcast({ message }, { signal })
  ])
}