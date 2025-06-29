import { connect, ConnectionOptions, NatsConnection } from "nats"; 

// @ts-ignore
const token = process.env.NATS_AUTH_TOKEN!
// @ts-ignore
const host = process.env.NATS_HOST! ?? "localhost:4222"

const NATS_CONFIG: ConnectionOptions = {
  servers: `nats://${host}`,
  token,
  reconnect: true,
  maxReconnectAttempts: -1,
  reconnectTimeWait: 2000,
}

let nc: NatsConnection | null = null;

export async function initNats() {
  try {
    nc = await connect(NATS_CONFIG);
    console.log(`Connected to ${NATS_CONFIG.servers}`)
  } catch (err) {
    throw new Error('NATS connection failed');
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
    console.log('NATS connection closed.')
  } catch (err) {
    console.error('Error closing NATS connection:', err)
  }
}