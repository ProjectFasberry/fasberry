import { sql } from "kysely";
import { general } from "../database/general-db"
import { appLogger } from "#/utils/config/logger";
import { invariant } from "#/helpers/invariant";

let CHATS: string[] | null = null;

async function getChatsQuery() {
  return general
    .selectFrom("tg_logs_chats")
    .select("chat_id")
    .orderBy(sql`CASE WHEN chat_id LIKE '-%' THEN 0 ELSE 1 END`)
    .execute()
}

export async function initChats() {
  try {
    const query = await getChatsQuery();
    CHATS = query.map(d => d.chat_id);
    appLogger.success(`Telegram chats inited. Loaded ${query.length}`)
  } catch (e) {
    appLogger.error(e)
  }
}

export async function revalidateChats(): Promise<
  { ok: true, data: { upd: number, prev: number }} | 
  { ok: false, error: Error | unknown }
> {
  const prev = CHATS?.length ?? 0;

  try {
    const query = await getChatsQuery()
    CHATS = query.map(d => d.chat_id);
    return { ok: true, data: { prev, upd: CHATS.length } }
  } catch (e) {
    appLogger.error(e)
    return { ok: false, error: e }
  }
}

export function getChats() {
  invariant(CHATS, "Chats is not defined")
  if (CHATS.length === 0) console.warn("Chats is empty")
  return CHATS
}