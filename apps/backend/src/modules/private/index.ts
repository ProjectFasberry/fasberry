import Elysia from "elysia";
import { options } from "./options";
import { openApiPlugin } from "#/lib/plugins/openapi";
import { permissions } from "./permissions";
import { defineAdmin } from "#/lib/middlewares/define";
import { HttpStatusEnum } from "elysia-http-status-code/status";

const config = { 
  detail: { hide: true } 
}

const validateRole = new Elysia()
  .use(defineAdmin())
  .get('/validate', async ({ status }) => status(HttpStatusEnum.HTTP_200_OK, { data: true }))

export const privated = new Elysia()
  .use(openApiPlugin)
  .group("/privated", config, ctx => ctx
    .use(validateRole)
    .use(options)
    .use(permissions)
  )