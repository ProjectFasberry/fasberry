import { createLogger } from '@neodx/log';

export const logger = createLogger({
  name: 'fasberry',
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
});

export const natsLogger = logger.child("NATS")