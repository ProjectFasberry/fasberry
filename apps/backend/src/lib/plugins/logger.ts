import Elysia from "elysia";
import { logger, type LoggerOptions } from "@tqman/nice-logger";

const loggerConfig: LoggerOptions = {
  enabled: true,
  withTimestamp: true
}

export const loggerPlugin = () => new Elysia().use(
  logger(loggerConfig)
)