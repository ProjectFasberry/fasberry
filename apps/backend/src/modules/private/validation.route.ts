import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { options } from "./options.route";
import { defineAdmin, defineUser, validateAdmin } from "#/lib/middlewares/define";

export const validateStatus = new Elysia()
  .use(defineUser())
  .get('/validate', async ({ nickname, status }) => {
    const data = await validateAdmin(nickname)
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  })

export const privated = new Elysia()
  .group("/privated", ctx => ctx
    .use(validateStatus)
    .use(defineAdmin())
    .use(options)
  )