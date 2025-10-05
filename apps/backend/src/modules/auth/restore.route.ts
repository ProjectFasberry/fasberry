import Elysia from "elysia";
import { ipPlugin } from "#/lib/plugins/ip";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { defineUser } from "#/lib/middlewares/define";

// todo: impl restore pass for user
export const restore = new Elysia()
  .use(ipPlugin())
  .use(defineUser())
  .post("/restore", async (ctx) => {

    return ctx.status(HttpStatusEnum.HTTP_200_OK)
  })