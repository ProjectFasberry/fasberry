import { abortablePromiseAll } from "#/helpers/abortable"
import { PaymentMeta, publishPaymentNotify } from "#/lib/publishers/pub-payment-notify"
import { callBroadcast } from "../server/call-broadcast"
import { AbortableCommandArgs } from "../server/call-command"

type GiveBelkoin = {
  nickname: string,
  value: number
}

async function giveBelkoin(
  { nickname, value }: GiveBelkoin,
  { signal }: AbortableCommandArgs
) {
  const payload = { parent: "p", value: `give ${nickname} ${value}`, };

  // @ts-expect-error
  return callServerCommand(payload, { signal })
}

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
    // @ts-expect-error
    (signal) => callServerCommand({ ...command }, { signal }),
    (signal) => callBroadcast({ message }, { signal }),
  ], controller)

  publishPaymentNotify({ nickname, paymentType, paymentValue })
}