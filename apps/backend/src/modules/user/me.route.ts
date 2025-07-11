import dayjs from 'dayjs';
import { throwError } from "#/helpers/throw-error";
import { auth } from "#/shared/database/auth-db";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { sessionDerive } from '#/lib/middlewares/session';
import { userDerive } from '#/lib/middlewares/user';

export const me = new Elysia()
  .use(sessionDerive())
  .use(userDerive())
  .get("/get-me", async ({ nickname, ...ctx }) => {
    try {
      const query = await auth
        .selectFrom("AUTH")
        .select([
          "AUTH.NICKNAME as nickname",
          "AUTH.UUID as uuid",
          "AUTH.ISSUEDTIME as issued_time",
          "AUTH.REGDATE as reg_date",
        ])
        .where("NICKNAME", "=", nickname)
        .executeTakeFirst()

      if (!query) {
        return ctx.status(HttpStatusEnum.HTTP_404_NOT_FOUND, { data: null })
      }

      const data = {
        ...query,
        issued_time: dayjs(Number(query.issued_time)).toDate(),
        reg_date: dayjs(Number(query.reg_date)).toDate()
      }

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  }, {
    beforeHandle: async ({ nickname, ...ctx }) => {
      if (!nickname) {
        return ctx.status(HttpStatusEnum.HTTP_401_UNAUTHORIZED, throwError("Unauthorized"))
      }
    }
  })