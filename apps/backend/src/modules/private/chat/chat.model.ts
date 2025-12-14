import { invariant } from "#/helpers/invariant";
import { general } from "#/shared/database/general-db"
import z from "zod"

export type ChatItem = {
  id: number;
  created_at: Date;
  edited: boolean;
  edited_at: Date | null;
  message: string;
  nickname: string;
  views: number
}

export type ChatEventVariant = "create" | "delete" | "edit"

export type ChatEvent<T> = {
  event: ChatEventVariant,
  data: T
}

export const chatCreateMessageSchema = z.object({
  message: z.string().min(1).max(2025)
})

export const chatDeleteMessageSchema = z.object({
  id: z.coerce.number()
})

export const chatEditMessageSchema = z.object({
  id: z.coerce.number(),
  message: z.string().min(1).max(2025)
})

export async function deleteMessage(nickname: string, id: number) {
  const query = await general
    .deleteFrom('privated_chat')
    .where("id", "=", id)
    .where("nickname", "=", nickname)
    .executeTakeFirstOrThrow()

  invariant(query.numDeletedRows, 'Not deleted')
  
  return query;
}

export async function editMessage(nickname: string, id: number, newMessage: string) {
  return general
    .updateTable('privated_chat')
    .set({
      message: newMessage,
      edited: true,
      edited_at: new Date().toISOString()
    })
    .where("id", "=", id)
    .where("nickname", "=", nickname)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function createMessage(nickname: string, message: string) {
  return general
    .insertInto("privated_chat")
    .values({ message, nickname })
    .returningAll()
    .executeTakeFirstOrThrow()
}

