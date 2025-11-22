import { getNats } from "#/shared/nats/client"
import { CONSUMERS } from "#/shared/nats/init";
import { SERVER_USER_EVENT_SUBJECT } from "#/shared/nats/subjects"
import { jetstream } from "@nats-io/jetstream";

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

const timeout = 2000

export const startOrderConsumer = async (): Promise<void> => {
  const nc = getNats();
  const js = jetstream(nc);

  const orderCons = CONSUMERS["order"][0]
  const с = await js.consumers.get(orderCons.stream_name, orderCons.name);

  while (true) {
    try {
      const msgs = await с.consume({ max_messages: 1, expires: 1000 });

      (async () => {
        for await (const s of await msgs.status()) {
          switch (s.type) {
            case "heartbeats_missed":
              console.log(`${s.count} heartbeats missed`);

              if (s.count === 2) {
                msgs.stop();
              }
          }
        }
      })();

      for await (const m of msgs) {
        const payload = m.data;

        console.log(new TextDecoder().decode(payload), m.seq, m.subject);

        const r = await nc.request(SERVER_USER_EVENT_SUBJECT, payload, { timeout })
        const res = r.json<ResponseMsg>();

        if ("error" in res) {
          m.nak()
          throw new Error(res.error);
        }

        m.ack();
      }
    } catch (e) {
      console.error(e);
    }
  }
}

export async function callServerCommand(
  { parent, value }: CallServerCommand,
  { signal }: AbortableCommandArgs
): Promise<{ result: "success" }> {
  try {
    const nc = getNats()

    const payload = {
      event: "executeCommand",
      comment: undefined,
      command: `${parent} ${value}`
    }

    const js = jetstream(nc);

    let pa = await js.publish("event.b", JSON.stringify(payload))

    const stream = pa.stream;
    const seq = pa.seq;
    const duplicate = pa.duplicate;

    console.log("pa", stream, seq, duplicate)

    return { result: "success" }
  } catch (e) {
    throw e
  }
}