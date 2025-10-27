import { general } from "#/shared/database/main-db"
import z from "zod"

type ControlPayload = { ok: boolean, updated: number }

const usersControlTargetsSchema = z.array(z.string())

export const usersControlRestrictSchema = z.object({
  type: z.enum(["ban", "mute"]),
  targets: usersControlTargetsSchema

})

export const usersControlSchema = z.object({
  type: z.enum(["unlogin", "notify"]),
  targets: usersControlTargetsSchema
})

export const usersControlRolesSchema = z.object({
  type: z.enum(["change_role", "reset"]),
  targets: usersControlTargetsSchema,
  targetRoleId: z.coerce.number()
})

export const playersControlPermissionsSchema = z.object({
  type: z.enum(["add", "remove"]),
  target: z.coerce.number(),
  targets: z.array(z.string())
})

type UsersControlSchema = z.infer<typeof usersControlSchema>
type UsersControlRolesSchema = z.infer<typeof usersControlRolesSchema>
type UsersControlRestrictSchema = z.infer<typeof usersControlRestrictSchema>
type UsersControlPermissionsSchema = z.infer<typeof playersControlPermissionsSchema>

async function banUsers(
  initiator: string,
  nicknames: UsersControlSchema["targets"]
): Promise<ControlPayload> {
  const payload = nicknames.map((target) => ({
    initiator,
    nickname: target
  }))

  const query = await general
    .insertInto("banned_users")
    .values(payload)
    .returning("nickname")
    .execute()

  return { ok: true, updated: query.length }
}

async function muteUsers(
  initiator: string,
  nicknames: UsersControlSchema["targets"]
): Promise<ControlPayload> {
  const query = await general
    .updateTable("players")
    .set({})
    .where("nickname", "in", nicknames)
    .returning("nickname")
    .execute()

  return { ok: true, updated: query.length }
}

async function notifyUsers(
  initiator: string,
  nicknames: UsersControlSchema["targets"]
): Promise<ControlPayload> {
  return { ok: true, updated: 0 }
}

async function unloginUsers(
  initiator: string,
  nicknames: UsersControlSchema["targets"]
): Promise<ControlPayload> {
  return { ok: true, updated: 0 }
}

export async function changeRoleUsers(
  nicknames: UsersControlSchema["targets"],
  { type, targetRoleId }: Omit<UsersControlRolesSchema, "targets">
): Promise<ControlPayload> {
  if (type === 'change_role') {
    const query = await general
      .updateTable("players")
      .set({ role_id: targetRoleId })
      .where("nickname", "in", nicknames)
      .returning("nickname")
      .execute()

    return { ok: true, updated: query.length }
  }

  if (type === 'reset') {
    return { ok: true, updated: 0 }
  }

  throw new Error(`Change role type is not defined "${type}"`)
}

export async function controlRestrictUsers(
  initiator: string,
  { targets, type }: UsersControlRestrictSchema,
) {
  const TARGETS_EVENTS: Record<UsersControlRestrictSchema["type"], (t: UsersControlRestrictSchema["targets"]) => Promise<ControlPayload>> = {
    ban: (targets) => banUsers(initiator, targets),
    mute: (targets) => muteUsers(initiator, targets),
  }

  const event = TARGETS_EVENTS[type];
  return event(targets)
}

export async function controlUsers(
  initiator: string,
  { targets: nicknames, type }: UsersControlSchema
) {
  const TARGETS_EVENTS: Record<UsersControlSchema["type"], (t: UsersControlSchema["targets"]) => Promise<ControlPayload>> = {
    notify: (targets) => notifyUsers(initiator, targets),
    unlogin: (targets) => unloginUsers(initiator, targets),
  }

  const event = TARGETS_EVENTS[type];
  return event(nicknames)
}

export async function editPlayerRole(
  initiator: string,
  nicknames: string[],
  { target, type }: Omit<UsersControlPermissionsSchema, "targets">
) {
  

  return {}
}