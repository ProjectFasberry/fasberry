import { sql } from "kysely";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { sqlite } from "#/shared/database/sqlite-db";
import { bisquite } from "#/shared/database/bisquite-db";
import { publishVoteNotify } from "#/lib/publishers/pub-vote-notify";

async function postVoted(nickname: string) {
  const result = await sqlite
    .insertInto("voted_users")
    .values({ nickname })
    .onConflict((ob) => ob.column("nickname").doNothing())
    .execute();

  if (Number(result[0].numInsertedOrUpdatedRows) === 0) {
    return
  }

  const { reward } = await sqlite
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

export const processPlayerVote = new Elysia()
  .post("/process-player-vote", async (ctx) => {
    const parsedBody = await ctx.body as { nick: string, time: string, sign: string }

    const nick = parsedBody["nick"]
    const time = parsedBody["time"]
    const sign = parsedBody["sign"]

    if (!nick || !time || !sign) {
      return ctx.status(HttpStatusEnum.HTTP_400_BAD_REQUEST, "error");
    }

    if (nick.length > 16) {
      return ctx.status(HttpStatusEnum.HTTP_400_BAD_REQUEST, 'nickname limit');
    }

    const expSign = new Bun.CryptoHasher("sha1")
      .update(nick + time + Bun.env.VOTIFIEF_SECRET_KEY)
      .digest('hex');

    if (sign !== expSign) {
      return ctx.status(HttpStatusEnum.HTTP_400_BAD_REQUEST, 'error');
    }

    await postVoted(nick);

    return ctx.status(HttpStatusEnum.HTTP_200_OK, 'ok');
  }, {
    parse: "multipart/form-data"
  })