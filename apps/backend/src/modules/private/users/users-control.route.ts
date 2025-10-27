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

    createAdminActivityLog({ initiator: nickname, event: PERMISSIONS.PLAYERS.RESTRICT.CREATE })

    return { data }
  }, {
    body: usersControlRestrictSchema
  })

const playersControlRestrictDelete = new Elysia()
  .use(validatePermission(PERMISSIONS.PLAYERS.RESTRICT.DELETE))
  .delete("/remove", async ({ body, nickname }) => {
    const data = await controlRestrictUsers(nickname, body)

    createAdminActivityLog({ initiator: nickname, event: PERMISSIONS.PLAYERS.RESTRICT.DELETE })

    return { data }
  }, {
    body: usersControlRestrictSchema
  })

const playersControlRestrict = new Elysia()
  .group("/restrict", app => app
    .use(playersControlRestrictCreate)
    .use(playersControlRestrictDelete)
  )

const playersControlRoles = new Elysia()
  .use(validatePermission(PERMISSIONS.PLAYERS.ROLE.UPDATE))
  .post("/roles", async ({ nickname, body }) => {
    const { targets, ...base } = body;
    const data = await changeRoleUsers(targets, base)

    createAdminActivityLog({ initiator: nickname, event: PERMISSIONS.PLAYERS.ROLE.UPDATE })

    return { data }
  }, {
    body: usersControlRolesSchema
  })

const playersControlPermissions = new Elysia()
  .use(validatePermission(PERMISSIONS.PLAYERS.PERMISSION.UPDATE))
  .post("/permission", async ({ nickname, body }) => {
    const { targets, ...base } = body;
    const data = await editPlayerRole(nickname, targets, base)

    createAdminActivityLog({ initiator: nickname, event: PERMISSIONS.PLAYERS.PERMISSION.UPDATE })

    return { data }
  }, {
    body: playersControlPermissionsSchema
  })

export const playersControl = new Elysia()
  .group("/control", app => app
    .use(playersControlRestrict)
    .use(playersControlRoles)
    .use(playersControlPermissions)
  )