import { callServerCommand } from "./call-command";

export async function callBroadcast(v: string): Promise<boolean> {
  return callServerCommand({ parent: "cmi", value: `broadcast ${v}` })
}