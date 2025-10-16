import Elysia from "elysia";
import { rolesList } from "./roles-list.route";

export const roles = new Elysia()
  .group("/role", app => app
    .use(rolesList)
  )