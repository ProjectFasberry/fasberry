import { abortablePromiseAll } from "#/helpers/abortable"
import { callBroadcast } from "../server/call-broadcast"
import type { AbortableCommandArgs } from "../server/call-command"

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
  nickname, value
}: { nickname: string, value: number }) {
  const controller = new AbortController();

  const message = `Игрок ${nickname} приобрел ${value} ед. белкоинов`
  const command = { parent: "cmi", value: `toast ${nickname} Поздравляем c покупкой!` }

  await abortablePromiseAll<ExtractAsyncResult<typeof giveBelkoin>>([
    (signal) => giveBelkoin({ nickname, value }, { signal }),
    // @ts-expect-error
    (signal) => callServerCommand({ ...command }, { signal }),
    (signal) => callBroadcast({ message }, { signal }),
  ], controller)
}