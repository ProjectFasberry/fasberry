import { getNatsConnection } from "#/shared/nats/nats-client"
import { SERVER_USER_EVENT_SUBJECT } from "#/shared/nats/nats-subjects"
import { logger } from "../config/logger"

type CommandType =
  | "lp" // luckperms
  | "sudo" // cmi sudo
  | "cmi" // cmi
  | "p" // player points

type CallServerCommand = {
  parent: CommandType | string,
  value: string
}

type ResponseMsg = {
  result: "ok"
} | {
  error: string
}

export type AbortableCommandArgs = {
  signal?: AbortSignal
}

export const callServerCommand = async (
  { parent, value }: CallServerCommand,
  { signal }: AbortableCommandArgs
): Promise<{ result: "success" | "error" }> => {
  const nc = getNatsConnection()

  try {
    const timeout = 1000

    const abortPromise = new Promise<never>((_, reject) => {
      if (!signal) return;

      signal.addEventListener("abort", () => {
        reject(new Error("Aborted by signal"))
      });
    });

    const message = { event: "executeCommand", command: `${parent} ${value}` }
    const payload = JSON.stringify(message)

    const res = await Promise.race([
      nc.request(SERVER_USER_EVENT_SUBJECT, payload, { timeout }),
      abortPromise,
    ]);

    const msg = res.json<ResponseMsg>()

    if ("error" in msg) {
      throw new Error(msg.error)
    }

    return { result: "success" }
  } catch (e) {
    logger.error(e)
    return { result: "error" }
  }
}