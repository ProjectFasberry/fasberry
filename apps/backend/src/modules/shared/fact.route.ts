import { throwError } from "#/helpers/throw-error";
import { sqlite } from "#/shared/database/sqlite-db";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";

const getRandomArbitrary = (min: number, max: number) => Math.random() * (max - min) + min;

export const fact = new Elysia()
  .get('/random-fact', async (ctx) => {
    const randomId = Math.floor(getRandomArbitrary(1, 97));

    try {
      const fact = await sqlite
        .selectFrom("minecraft_facts")
        .select("fact")
        .where("id", "=", randomId)
        .executeTakeFirst();

      if (!fact) {
        return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: null });
      }

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: fact.fact });
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e));
    }
  })