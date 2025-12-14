import { Bot, TelegramError } from "gramio";
import { isProduction, GUARD_BOT_TOKEN as token } from "../env";
import { logger } from "#/utils/config/logger";
import { GUARD_COMMANDS } from "./guard-cmds";
import { getChats } from "../constants/chats";

function validateChatId(chatId: string | number) {
  const chats = getChats();
  return chats.includes(chatId.toString())
}

export const botLogger = logger.withTag("Bot").withTag("Guard")

export function initCommands(bot: Bot) {
  for (const [cmd, { cb, type, publicCb }] of GUARD_COMMANDS) {
    bot.command(cmd, async (ctx) => {
      if (type === 'private') {
        const isValid = validateChatId(ctx.chat.id)
        if (!isValid) return;
      }

      if (type === 'public') {
        if (typeof publicCb === 'function') {
          publicCb(ctx)
        }
      }

      return cb(ctx)
    })
    botLogger.success(`Command "${cmd}" inited`)
  }
}

export let guardBot: Bot | null = null;

export function getGuardBot(): Bot {
  if (!guardBot) throw new Error("Guard bot is not defined")
  return guardBot
}

export async function startGuardBot() {
  guardBot = new Bot(token)
    .onStart(async (ctx) => {
      botLogger.success("Started")
      botLogger.log(ctx.updatesFrom, ctx.plugins, ctx.info)

      const bot = guardBot!;

      bot.api
        .setMyCommands({
          commands: [{ command: "start", description: "Начать" }]
        })
        .catch(e => botLogger.error(e))

      initCommands(bot)
    })
    .onError((ctx) => {
      const error = ctx.error;
      botLogger.error(error)
    })

  try {
    if (isProduction) {
      await guardBot.start()
    }
  } catch (e) {
    if (e instanceof TelegramError) {
      botLogger.warn("Guard bot is not started by conflict instances. But instance inited")
      await guardBot.init()
    }

    botLogger.error(e)
  }
}