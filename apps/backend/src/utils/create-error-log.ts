import { sqlite } from "#/shared/database/sqlite-db";

type CreateErrorLog = { type: string, description: string, initiator: string, recipient: string }

export async function createErrorLog({
  description, initiator, recipient, type
}: CreateErrorLog) {
  return sqlite
    .insertInto("errors_logs")
    .values({
      type, description, initiator, recipient
    })
    .returningAll()
    .executeTakeFirst();
}