import { logger } from "#/utils/config/logger";
import { ConnectionOptions, type NatsConnection } from "@nats-io/nats-core";
import { connect } from "@nats-io/transport-node";
import { exit } from "node:process";
import { NATS_HOST as host, NATS_TOKEN as token } from "#/shared/env"

export const natsLogger = logger.withTag("Nats")

const config: ConnectionOptions = {
  servers: [
    `nats://${host}`
  ],
  token,
  reconnect: true,
  maxReconnectAttempts: -1,
  reconnectTimeWait: 2000,
}

let nats: NatsConnection | null = null;

export async function initNats(): Promise<void> {
  try {
    nats = await connect(config);
    natsLogger.success(`Connected to ${config.servers}`)
  } catch (e) {
    natsLogger.error(e)
    exit(1)
  }
}

export function getNats(): NatsConnection {
  if (!nats) throw new Error('NATS client is not initialized');
  return nats;
}

export async function closeNats(): Promise<void> {
  if (!nats) return;

  try {
    await nats.drain();
    natsLogger.log('NATS connection closed.')
  } catch (err) {
    natsLogger.error('Error closing NATS connection:', err)
    exit(1)
  }
}