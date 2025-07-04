import { callServerCommand } from "./call-command";

export async function giveCharism(nickname: string, value: number) {
  return callServerCommand({ parent: "cmi", value: `money give ${nickname} ${value}` })
}