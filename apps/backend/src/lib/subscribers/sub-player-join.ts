import dayjs from 'dayjs';
import { getNats, natsLogger } from "#/shared/nats/client"
import { SERVER_USER_EVENT_SUBJECT, USER_REFERAL_CHECK_SUBJECT } from "#/shared/nats/subjects"
import { z } from "zod"
import { logError, logger } from '#/utils/config/logger';
import { general } from '#/shared/database/main-db';
import { safeJsonParse } from '#/utils/config/transforms';
import { Msg } from '@nats-io/nats-core/lib/core';

const userJoinSchema = z.object({
  date: z.string(),
  nickname: z.string(),
  event: z.enum(["join", "quit"])
})

function pushToReferral(
  { nickname }: { nickname: string }
) {
  const nc = getNats()

  const payload = new TextEncoder().encode(nickname)
  nc.publish(USER_REFERAL_CHECK_SUBJECT, payload)
}

async function joinEvents(
  { nickname, date }: Omit<z.infer<typeof userJoinSchema>, "event">
) {
  pushToReferral({ nickname });

  const query = await general
    .insertInto("activity_users")
    .values({
      event: new Date().toISOString(),
      nickname,
      type: "join"
    })
    .executeTakeFirst()

  if (Number(query.numInsertedOrUpdatedRows)) {
    console.log("updated", query.insertId)
  }
}

async function quitEvents(
  { nickname, date }: Omit<z.infer<typeof userJoinSchema>, "event">
) {
  const query = await general
    .insertInto("activity_users")
    .values({
      event: new Date().toISOString(),
      nickname,
      type: "quit"
    })
    .executeTakeFirst()

  if (!query.numInsertedOrUpdatedRows) {
    logger.warn(`Activity for ${nickname} is not created`)
  }
}

async function handlePlayerJoin(msg: Msg) {
  const str = new TextDecoder().decode(msg.data);

  const result = safeJsonParse<z.infer<typeof userJoinSchema>>(str)
  if (!result.ok) return;

  const payload = result.value

  if (!userJoinSchema.shape.event.options.includes(payload.event)) {
    return;
  }

  const { success, data } = userJoinSchema.safeParse(payload)
  if (!success) return;

  try {
    natsLogger.log(`${data.nickname} ${data.event}`, dayjs().format("HH:mm:ss YYYY-MM-DD"))

    switch (data.event) {
      case "join":
        joinEvents(data);
        break;
      case "quit":
        quitEvents(data)
        break;
    }
  } catch (e) {
    logError(e)
  }
}

export const subscribePlayerJoin = () => {
  const nc = getNats()

  const subscription = nc.subscribe(SERVER_USER_EVENT_SUBJECT, {
    callback: (e, msg) => {
      if (e) return logError(e)

      void handlePlayerJoin(msg)
    }
  })

  return subscription
}