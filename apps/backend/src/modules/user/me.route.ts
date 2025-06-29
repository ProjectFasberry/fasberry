import dayjs from 'dayjs';
import { throwError } from "#/helpers/throw-error";
import { auth } from "#/shared/auth-db";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";

export const me = new Elysia()
  .derive(
    { as: "global" },
    ({ cookie }) => ({ session: cookie["session"].value ?? null })
  )
  .get("/get-me", async (ctx) => {
    const token = ctx.session as string | null;

    if (!token) {
      ctx.status(HttpStatusEnum.HTTP_401_UNAUTHORIZED)
      return { error: "Unauthorized" }
    }

    try {
      const query = await auth
        .selectFrom("AUTH")
        .innerJoin("sessions", "sessions.nickname", "AUTH.NICKNAME")
        .select([
          "AUTH.NICKNAME as nickname",
          "AUTH.UUID as uuid",
          "AUTH.ISSUEDTIME as issued_time",
          "AUTH.REGDATE as reg_date",
        ])
        .where("sessions.token", "=", token)
        .executeTakeFirst()

      if (!query) {
        ctx.status(HttpStatusEnum.HTTP_404_NOT_FOUND)

        return { data: null }
      }

      ctx.status(HttpStatusEnum.HTTP_200_OK)
      
      const data = {
        ...query,
        issued_time: dayjs(Number(query.issued_time)).toDate(),
        reg_date: dayjs(Number(query.reg_date)).toDate()
      }

      return { data };
    } catch (e) {
      ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR)
      
      return { error: throwError(e) }
    }
  })