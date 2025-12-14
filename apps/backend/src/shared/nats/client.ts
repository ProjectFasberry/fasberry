import { logger } from "#/utils/config/logger";
import type { ConnectionOptions, NatsConnection } from "@nats-io/nats-core";
import { connect } from "@nats-io/transport-node";
import { NATS_HOST as host, NATS_PASSWORD, NATS_USER } from "#/shared/env"
import { invariant } from "#/helpers/invariant";

export const natsLogger = logger.withTag("Nats")

const config: ConnectionOptions = {
  servers: [
    `nats://${host}`
  ],
  user: NATS_USER,
  pass: NATS_PASSWORD,
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
    process.exit(1)
  }
}

export function getNats(): NatsConnection {
  invariant(nats, 'NATS client is not initialized' )
  return nats;
}

export async function closeNats(): Promise<void> {
  if (!nats) return;

  try {
    await nats.drain();
    natsLogger.log('NATS connection closed.')
  } catch (e) {
    natsLogger.error('Error closing NATS connection:', e)
    process.exit(1)
  }
}