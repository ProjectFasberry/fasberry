import { abortablePromiseAll } from "#/helpers/abortable"
import { callBroadcast } from "../server/call-broadcast"
import { type AbortableCommandArgs, callServerCommand } from "../server/call-command"

type GiveCharism = { nickname: string, value: number }

async function giveCharism(
  { nickname, value }: GiveCharism,
  { signal }: AbortableCommandArgs
) {
  const payload = { parent: "cmi", value: `money give ${nickname} ${value}` }

  // @ts-expect-error
  return callServerCommand(payload, { signal})
}

export async function processCharismPayment({
  nickname, value
}: { nickname: string, value: number }) {
  const message = `Игрок ${nickname} приобрел ${value} ед. харизмы`

  await abortablePromiseAll([
    (signal) => giveCharism({ nickname, value }, { signal }),
    (signal) => callServerCommand({ parent: "cmi", value: `toast ${nickname} Поздравляем с покупкой` }, { signal }),
    (signal) => callBroadcast({ message }, { signal }),
  ])
}