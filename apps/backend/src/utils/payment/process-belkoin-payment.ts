import { abortablePromiseAll } from "#/helpers/abortable"
import { callBroadcast } from "../server/call-broadcast"
import { callServerCommand } from "../server/call-command";

type GiveBelkoin = {
  nickname: string,
  value: number
}

async function giveBelkoin(
  { nickname, value }: GiveBelkoin,
) {
  const payload = { parent: "p", value: `give ${nickname} ${value}`, } as const;;
  return callServerCommand(payload)
}

type ExtractAsyncResult<T extends (...args: any) => any> =
  Awaited<ReturnType<T>>;

export async function processBelkoinPayment({
  nickname, value
}: { nickname: string, value: number }) {
  const controller = new AbortController();

  const message = `Игрок ${nickname} приобрел ${value} ед. белкоинов`
  const command = { parent: "cmi", value: `toast ${nickname} Поздравляем c покупкой!` } as const;

  await abortablePromiseAll<ExtractAsyncResult<typeof giveBelkoin>>([
    () => giveBelkoin({ nickname, value }),
    () => callServerCommand({ ...command }),
    () => callBroadcast({ message }),
  ], controller)
}