import { AbortableCommandArgs, callServerCommand } from "./call-command";

type GiveCharism = { nickname: string, value: number }

export async function giveCharism(
  { nickname, value }: GiveCharism,
  { signal }: AbortableCommandArgs
) {
  const payload = { parent: "cmi", value: `money give ${nickname} ${value}` }

  return callServerCommand(payload, { signal})
}