import { AbortableCommandArgs, callServerCommand } from "./call-command";

type GiveBelkoin = {
  nickname: string,
  value: number
}
export async function giveBelkoin(
  { nickname, value }: GiveBelkoin,
  { signal }: AbortableCommandArgs
) {
  const payload = { parent: "p", value: `give ${nickname} ${value}`, };

  return callServerCommand(payload, { signal })
}