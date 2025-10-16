import Elysia from "elysia";
import { sql } from "kysely";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { bisquite } from "#/shared/database/bisquite-db";
import { publishVoteNotify } from "#/lib/publishers/pub-vote-notify";
import { general } from "#/shared/database/main-db";

async function postVoted(nickname: string) {
  const result = await general
    .insertInto("voted_users")
    .values({ nickname })
    .onConflict((ob) => ob.column("nickname").doNothing())
    .execute();

  if (Number(result[0].numInsertedOrUpdatedRows) === 0) {
    return
  }

  const { reward } = await general
    .selectFrom("events")
    .select("reward")
    .where("origin", "=", "vote-for-server")
    .executeTakeFirstOrThrow()

  const addCharism = await bisquite
    .updateTable("CMI_users")
    .set({
      Balance: sql`Balance + ${Number(reward)}`
    })
    .where("username", "=", nickname)
    .executeTakeFirstOrThrow()

  if (Number(addCharism.numUpdatedRows) === 0) {
    return
  }

  publishVoteNotify(nickname)

  return
}

type Payload = { nick: string, time: string, sign: string }

export const processPlayerVote = new Elysia()
  .post("/vote", async ({ body, status }) => {
    const parsedBody = await body as Payload

    const nick = parsedBody["nick"]
    const time = parsedBody["time"]
    const sign = parsedBody["sign"]

    if (!nick || !time || !sign) {
      status(HttpStatusEnum.HTTP_400_BAD_REQUEST);
      return "error"
    }

    if (nick.length > 16) {
      status(HttpStatusEnum.HTTP_400_BAD_REQUEST);
      return "nickname limit"
    }

    const expSign = new Bun.CryptoHasher("sha1")
      .update(nick + time + Bun.env.VOTIFIEF_SECRET_KEY)
      .digest('hex');

    if (sign !== expSign) {
      status(HttpStatusEnum.HTTP_400_BAD_REQUEST)
      return "error"
    }

    await postVoted(nick);

    return "ok"
  }, {
    parse: "multipart/form-data"
  })