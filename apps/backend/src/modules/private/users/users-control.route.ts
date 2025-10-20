import Elysia from "elysia";
import { changeRoleUsers, controlPunishUsers, usersControlRolesSchema, usersControlSchema } from "./users-control.model";
import { defineUser } from "#/lib/middlewares/define";

const usersControlPunish = new Elysia()
  .use(defineUser())
  .post("/punish", async ({ body, nickname }) => {
    const data = await controlPunishUsers(body, nickname)
    return { data }
  }, {
    body: usersControlSchema
  })


const usersControlRoles = new Elysia()
  .post("/roles", async ({ body }) => {
    const { targets, ...base } = body;
    const data = await changeRoleUsers(targets, base)
    return { data }
  }, {
    body: usersControlRolesSchema
  })

export const usersControl = new Elysia()
  .group("/control", app => app
    .use(usersControlPunish)
    .use(usersControlRoles)
  )
