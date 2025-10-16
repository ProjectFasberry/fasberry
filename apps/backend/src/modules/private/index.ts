import Elysia from "elysia";
import { options } from "./options";
import { hideOpenApiConfig, openApiPlugin } from "#/lib/plugins/openapi";
import { permissions } from "./permissions";
import { defineAdmin } from "#/lib/middlewares/define";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { storePrivate } from "./store";
import { users } from "./users";
import { roles } from "./roles";

const validateRole = new Elysia()
  .get('/validate', async ({ status }) => status(HttpStatusEnum.HTTP_200_OK, { data: true }))

export const privated = new Elysia()
  .use(openApiPlugin)
  .group("/privated", hideOpenApiConfig, ctx => ctx
    .use(defineAdmin())
    .use(validateRole)
    .use(options)
    .use(permissions)
    .use(storePrivate)
    .use(users)
    .use(roles)
  )