import Elysia from "elysia";
import { defineAdmin } from "#/lib/middlewares/define";
import { permissionsList } from "./permissions-list.route";

export const permissions = new Elysia()
  .use(defineAdmin())
  .group("/permissions", app => app
    .use(permissionsList)
  )