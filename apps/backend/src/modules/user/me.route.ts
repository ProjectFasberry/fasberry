import Elysia, { t } from "elysia";
import dayjs from 'dayjs';
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { defineOptionalUser } from "#/lib/middlewares/define";
import { MePayload } from "@repo/shared/types/entities/user"
import { validateBannedStatus } from "#/lib/middlewares/validators";
import { defineOptions, getMe } from "./me.model";

export const me = new Elysia()
  .use(validateBannedStatus())
  .use(defineOptionalUser())
  .model({
    me: t.Object({
      data: t.Object({
        nickname: t.String(),
        uuid: t.String(),
        meta: t.Object({
          login_date: t.Date(),
          reg_date: t.Date(),
        }),
        options: t.Object({
          permissions: t.Array(t.String())
        })
      })
    })
  })
  .get("/me", async ({ nickname, status }) => {
    if (!nickname) {
      return status(HttpStatusEnum.HTTP_404_NOT_FOUND, { data: null })
    }

    const query = await getMe(nickname)

    if (!query) {
      return status(HttpStatusEnum.HTTP_404_NOT_FOUND, { data: null })
    }

    const { reg_date, login_date, role_id, ...base } = query;

    const options = await defineOptions(role_id);

    const loginDate = dayjs(Number(query.login_date)).toDate();
    const regDate = dayjs(Number(query.reg_date)).toDate()

    const data: MePayload = {
      ...base,
      meta: {
        login_date: loginDate,
        reg_date: regDate,
      },
      options
    }

    return { data }
  }, {
    response: {
      200: "me",
      404: t.Object({ data: t.Null() })
    }
  })