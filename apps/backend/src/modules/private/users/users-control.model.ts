import { general } from "#/shared/database/main-db"
import z from "zod"

type ControlPayload = { ok: boolean, updated: number }

const usersControlTargetsSchema = z.array(z.string())

export const usersControlSchema = z.object({
  type: z.enum(["ban", "mute", "unlogin", "notify"]),
  targets: usersControlTargetsSchema
})

type SchemaControl = z.infer<typeof usersControlSchema>
type SchemaControlRoles = z.infer<typeof usersControlRolesSchema>

async function banUsers(initiator: string, nicknames: SchemaControl["targets"]): Promise<ControlPayload> {
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

async function muteUsers(initiator: string, nicknames: SchemaControl["targets"]): Promise<ControlPayload> {
  const query = await general
    .updateTable("players")
    .set({})
    .where("nickname", "in", nicknames)
    .returning("nickname")
    .execute()

  return { ok: true, updated: query.length }
}

async function notifyUsers(initiator: string, initiatornicknames: SchemaControl["targets"]): Promise<ControlPayload> {
  return { ok: true, updated: 0 }
}

async function unloginUsers(initiator: string, nicknames: SchemaControl["targets"]): Promise<ControlPayload> {
  return { ok: true, updated: 0 }
}

export async function changeRoleUsers(
  nicknames: SchemaControl["targets"],
  { type, targetRoleId }: Omit<SchemaControlRoles, "targets">
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

export async function controlPunishUsers(
  { targets, type }: SchemaControl,
  initiator: string
) {
  const TARGETS_EVENTS: Record<SchemaControl["type"], (targets: SchemaControl["targets"]) => Promise<ControlPayload>> = {
    ban: (targets) => banUsers(initiator, targets),
    mute: (targets) => muteUsers(initiator, targets),
    notify: (targets) => notifyUsers(initiator, targets),
    unlogin: (targets) => unloginUsers(initiator, targets),
  }

  const event = TARGETS_EVENTS[type];

  return event(targets)
}

export const usersControlRolesSchema = z.object({
  type: z.enum(["change_role", "reset"]),
  targets: usersControlTargetsSchema,
  targetRoleId: z.coerce.number()
})
