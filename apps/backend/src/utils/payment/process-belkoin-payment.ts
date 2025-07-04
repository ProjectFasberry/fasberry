import { PaymentMeta, publishPaymentNotify } from "#/lib/publishers/pub-payment-notify"
import { callBroadcast } from "../server/call-broadcast"
import { callServerCommand } from "../server/call-command"
import { giveBelkoin } from "../server/give-belkoin"

export async function processBelkoinPayment({
  nickname, paymentType, paymentValue
}: PaymentMeta) {
  const value = Number(paymentValue)
  const message = `Игрок ${nickname} приобрел ${paymentValue} ед. белкоинов`

  await Promise.all([
    giveBelkoin(nickname, value),
    callServerCommand({ parent: "cmi", value: `toast ${nickname} Поздравляем c покупкой` }),
    callBroadcast(message),
  ])

  publishPaymentNotify({ nickname, paymentType, paymentValue })
}