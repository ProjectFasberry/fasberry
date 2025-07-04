// replace to the nats call

import { callServerCommand } from "./call-command";

export async function giveBelkoin(nickname: string, value: number) {
  return callServerCommand({ parent: "p", value: `give ${nickname} ${value}` })
}