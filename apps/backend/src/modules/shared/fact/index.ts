import Elysia, { t } from "elysia";
import { general } from "#/shared/database/main-db";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { sql } from "kysely";
import { withData } from "#/shared/schemas";

export const fact = new Elysia()
  .get('/random-fact', async ({ status }) => {
    const fact = await general
      .selectFrom('facts')
      .select('fact')
      .where(
        'id',
        '=',
        sql<number>`(
          SELECT FLOOR(random() * (SELECT COUNT(*) FROM facts)) + 1
          )`
      )
      .executeTakeFirst();

    if (!fact) {
      return status(HttpStatusEnum.HTTP_200_OK, { data: null });
    }

    return status(HttpStatusEnum.HTTP_200_OK, { data: fact.fact });
  }, {
    response: {
      200: withData(t.String())
    }
  })