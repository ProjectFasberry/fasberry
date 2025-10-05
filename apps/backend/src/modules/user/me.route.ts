import Elysia from "elysia";
import dayjs from 'dayjs';
import { general } from "#/shared/database/main-db";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { defineOptionalUser } from "#/lib/middlewares/define";

type MePayload = {
  nickname: string,
  uuid: string,
  issued_time: Date,
  reg_date: Date
}

export const me = new Elysia()
  .use(defineOptionalUser())
  .get("/me", async ({ nickname, status }) => {
    if (!nickname) {
      return status(HttpStatusEnum.HTTP_404_NOT_FOUND, { data: null })
    }
    
    const query = await general
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
      return status(HttpStatusEnum.HTTP_404_NOT_FOUND, { data: null })
    }

    if (!query.uuid) {
      console.warn(`Player "${nickname}" has no UUID`);
      return null;
    }

    const uuid = query.uuid

    const data: MePayload  = {
      ...query,
      uuid,
      issued_time: dayjs(Number(query.issued_time)).toDate(),
      reg_date: dayjs(Number(query.reg_date)).toDate()
    }

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  })