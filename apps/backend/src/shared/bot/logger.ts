import { Bot } from "gramio";

export const bot = new Bot(Bun.env.BOT!).onStart(console.log)