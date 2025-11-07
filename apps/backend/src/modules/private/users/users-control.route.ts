import Elysia from "elysia";
import {
  changeRoleUsers,
  controlRestrictUsers,
  editPlayerRole,
  playersControlPermissionsSchema,
  usersControlRestrictSchema,
  usersControlRolesSchema,
} from "./users-control.model";
import { validatePermission } from "#/lib/middlewares/validators";
import { PERMISSIONS } from "#/shared/constants/permissions";
import { createAdminActivityLog } from "../private.model";

const playersControlRestrictCreate = new Elysia()
  .use(validatePermission(PERMISSIONS.PLAYERS.RESTRICT.CREATE))
  .post("/create", async ({ body, nickname }) => {
    const data = await controlRestrictUsers(nickname, body)
    return { data }
  }, {
    body: usersControlRestrictSchema,
    afterResponse: ({ nickname: initiator, permission }) => {
      createAdminActivityLog({ initiator, event: permission })
    }
  })

const playersControlRestrictDelete = new Elysia()
  .use(validatePermission(PERMISSIONS.PLAYERS.RESTRICT.DELETE))
  .delete("/remove", async ({ body, nickname }) => {
    const data = await controlRestrictUsers(nickname, body)
    return { data }
  }, {
    body: usersControlRestrictSchema,
    afterResponse: ({ nickname: initiator, permission }) => {
      createAdminActivityLog({ initiator, event: permission })
    }
  })

const playersControlRestrict = new Elysia()
  .group("/restrict", app => app
    .use(playersControlRestrictCreate)
    .use(playersControlRestrictDelete)
  )

const playersControlRoles = new Elysia()
  .use(validatePermission(PERMISSIONS.PLAYERS.ROLE.UPDATE))
  .post("/roles", async ({ body }) => {
    const { targets, ...base } = body;
    const data = await changeRoleUsers(targets, base)
    return { data }
  }, {
    body: usersControlRolesSchema,
    afterResponse: ({ nickname: initiator, permission }) => {
      createAdminActivityLog({ initiator, event: permission })
    }
  })

const playersControlPermissions = new Elysia()
  .use(validatePermission(PERMISSIONS.PLAYERS.PERMISSION.UPDATE))
  .post("/permission", async ({ nickname, body }) => {
    const { targets, ...base } = body;
    const data = await editPlayerRole(nickname, targets, base)
    return { data }
  }, {
    body: playersControlPermissionsSchema,
    afterResponse: ({ nickname: initiator, permission }) => {
      createAdminActivityLog({ initiator, event: permission })
    }
  })

export const playersControl = new Elysia()
  .group("", app => app
    .use(playersControlRestrict)
    .use(playersControlRoles)
    .use(playersControlPermissions)
  )