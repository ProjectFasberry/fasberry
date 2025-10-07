import { getNats } from "#/shared/nats/client"
import { SERVER_USER_EVENT_SUBJECT } from "#/shared/nats/subjects"
import { withAbort } from "#/helpers/abortable"

type CommandType =
  | "lp" // luckperms
  | "sudo" // cmi sudo
  | "cmi" // cmi
  | "p" // player points

type CallServerCommand = {
  parent: CommandType,
  value: string
}

type ResponseMsg = {
  result: "ok"
} | {
  error: string
}

export type AbortableCommandArgs = {
  signal: AbortSignal
}

const timeout = 5000

export async function callServerCommand(
  { parent, value }: CallServerCommand,
  { signal }: AbortableCommandArgs
): Promise<{ result: "success" }> {
  const nc = getNats()

  try {
    const message = { event: "executeCommand", command: `${parent} ${value}` }

    const natsRequest = nc.request(
      SERVER_USER_EVENT_SUBJECT, JSON.stringify(message), { timeout }
    );

    const res = await withAbort(natsRequest, signal);
    const msg = res.json<ResponseMsg>()

    if ("error" in msg) {
      throw new Error(msg.error)
    }

    return { result: "success" }
  } catch (e) {
    throw e
  }
}