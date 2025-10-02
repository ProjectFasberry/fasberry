import { consola, createConsola } from "consola";

export const logger = createConsola();

export function logError(e: Error | unknown) {
  if (e instanceof Error) {
    logger.error(e.message)
  }
}