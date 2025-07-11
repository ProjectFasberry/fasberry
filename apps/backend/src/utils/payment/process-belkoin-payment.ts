import { abortablePromiseAll } from "#/helpers/abortable"
import { PaymentMeta, publishPaymentNotify } from "#/lib/publishers/pub-payment-notify"
import { callBroadcast } from "../server/call-broadcast"
import { callServerCommand } from "../server/call-command"
import { giveBelkoin } from "../server/give-belkoin"

type ExtractAsyncResult<T extends (...args: any) => any> =
  Awaited<ReturnType<T>>;

export async function processBelkoinPayment({
  nickname, paymentType, paymentValue
}: PaymentMeta) {
  const controller = new AbortController();

  const value = Number(paymentValue)
  const message = `Игрок ${nickname} приобрел ${paymentValue} ед. белкоинов`
  const command = { parent: "cmi", value: `toast ${nickname} Поздравляем c покупкой!` }

  await abortablePromiseAll<ExtractAsyncResult<typeof giveBelkoin>>([
    (signal) => giveBelkoin({ nickname, value }, { signal }),
    (signal) => callServerCommand({ ...command }, { signal }),
    (signal) => callBroadcast({ message }, { signal }),
  ], controller)

  publishPaymentNotify({ nickname, paymentType, paymentValue })
}