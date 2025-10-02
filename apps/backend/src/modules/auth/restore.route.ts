import { throwError } from "#/helpers/throw-error";
import { ipPlugin } from "#/lib/plugins/ip";
import { sessionDerive } from "#/lib/middlewares/session";
import { userDerive } from "#/lib/middlewares/user";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";

// todo: impl restore pass for user
export const restore = new Elysia()
  .use(ipPlugin())
  .use(userDerive())
  .use(sessionDerive())
  .post("/restore", async (ctx) => {

    try {


      return ctx.status(HttpStatusEnum.HTTP_200_OK)
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  })