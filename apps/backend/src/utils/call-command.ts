import { getNatsConnection } from "#/shared/nats/nats-client"
import { SERVER_USER_EVENT_SUBJECT } from "#/shared/nats/nats-subjects"

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

export const callServerCommand = async ({
  parent, value
}: CallServerCommand) => {
  const nc = getNatsConnection()

  try {
    const message = {
      event: "executeCommand", 
      command: `${parent} ${value}`
    }

    const res = await nc.request(SERVER_USER_EVENT_SUBJECT, JSON.stringify(message), { timeout: 7000 })
    const msg = res.json<ResponseMsg>()

    if ("error" in msg) {
      throw new Error(msg.error)
    }

    return true
  } catch (e) {
    console.error(e)

    return false
  }
}