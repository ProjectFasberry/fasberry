import { sql } from "kysely";
import { general } from "../database/general-db"
import { appLogger } from "#/utils/config/logger";

let CHATS: string[] = []

export async function initChats() {
  const query = await general
    .selectFrom("tg_logs_chats")
    .select("chat_id")
    .orderBy(sql`CASE WHEN chat_id LIKE '-%' THEN 0 ELSE 1 END`)
    .execute();

  CHATS = query.map(d => d.chat_id);

  appLogger.success(`Telegram chats inited. Loaded ${query.length}`)
}

export function getChats() {
  if (CHATS.length === 0) console.warn("Chats is empty")
  return CHATS
}