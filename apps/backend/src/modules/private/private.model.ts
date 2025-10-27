import { general } from "#/shared/database/main-db";
import { getNats } from "#/shared/nats/client";

export const ACTIVITY_LOG_SUBJECT = "admin.activity.log"

export async function createAdminActivityLog(
  { event, initiator }: { event: string, initiator: string }
) {
  const query = await general
    .insertInto("admin_activity_log")
    .values({
      initiator, event
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  const nc = getNats()

  nc.publish(ACTIVITY_LOG_SUBJECT, JSON.stringify(query))

  return query;
}