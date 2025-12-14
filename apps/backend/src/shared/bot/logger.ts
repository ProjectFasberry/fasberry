import { Bot } from "gramio";
import { LOGGER_BOT_TOKEN as token } from "../env";
import { logger } from "#/utils/config/logger";

const botLogger = logger.withTag("Bot").withTag("Logger")

export let loggerBot: Bot | null = null;

export function getLoggerBot(): Bot {
  if (!loggerBot) throw new Error("Logger bot is not defined")
  return loggerBot;
}

export function initLoggerBot() {
  try {
    loggerBot = new Bot(token)
      .onStart((ctx) => {
        botLogger.success("Started")
        botLogger.log(ctx.updatesFrom, ctx.plugins, ctx.info)


      })
      .onError((ctx) => {
        const error = ctx.error;
        botLogger.error(error)
      })

    loggerBot.init()
  } catch (e) {
    botLogger.error(e)
  }
}