import { logger } from "#/utils/config/logger";
import { connect, ConnectionOptions, type NatsConnection } from "nats"; 
import { exit } from "node:process";

const servers = `nats://${Bun.env.NATS_HOST}`

const NATS_CONFIG: ConnectionOptions = {
  servers,
  token: Bun.env.NATS_AUTH_TOKEN,
  reconnect: true,
  maxReconnectAttempts: -1,
  reconnectTimeWait: 2000, 
}

let nats: NatsConnection | null = null;

export async function initNats() {
  try {
    nats = await connect(NATS_CONFIG);
    logger.success(`Connected to ${NATS_CONFIG.servers}`)
  } catch (e) {
    logger.error("NATS ", e)
    exit(1)
  }
}

export function getNatsConnection(): NatsConnection {
  if (!nats) throw new Error('NATS client is not initialized');
  return nats;
}

export async function closeNatsConnection() {
  if (!nats) return;

  try {
    await nats.drain();
    logger.log('NATS connection closed.')
  } catch (err) {
    logger.error('Error closing NATS connection:', err)
    exit(1)
  }
}