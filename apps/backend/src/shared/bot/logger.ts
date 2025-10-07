import { Bot } from "gramio";
import { LGOGER_BOT_TOKEN as token } from "../env";
import { logger } from "#/utils/config/logger";

const botLogger = logger.withTag("Bot.Logger")

export const bot = new Bot(token)
  .onStart(() => botLogger.success("Started"))
  .onError((ctx) => {
    const error = ctx.error;
    botLogger.error(error)
  })