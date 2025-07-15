import { logger } from "#/utils/config/logger";
import { connect, ConnectionOptions, type NatsConnection } from "nats"; 

const NATS_CONFIG: ConnectionOptions = {
  servers: `nats://${Bun.env.NATS_HOST ?? "localhost:4223"}`,
  token: Bun.env.NATS_AUTH_TOKEN,
  reconnect: true,
  maxReconnectAttempts: -1,
  reconnectTimeWait: 2000,
}

let nc: NatsConnection | null = null;

export async function initNats() {
  try {
    nc = await connect(NATS_CONFIG);
    logger.success(`Connected to ${NATS_CONFIG.servers}`)
  } catch (e) {
    logger.error("NATS ", e)
  }
}

export function getNatsConnection(): NatsConnection {
  if (!nc) {
    throw new Error('NATS client is not initialized');
  }

  return nc;
}

export async function closeNatsConnection() {
  if (!nc) return;

  try {
    await nc.drain();
    logger.log('NATS connection closed.')
  } catch (err) {
    logger.error('Error closing NATS connection:', err)
  }
}