import { Bot } from "gramio";

const token = Bun.env.BOT_TOKEN

export const bot = new Bot(token).onStart(() => console.log("Bot started"))