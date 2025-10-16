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

async function banUsers(nicknames: SchemaControl["targets"]): Promise<ControlPayload> {
  const query = await general
    .updateTable("players")
    .set({})
    .returning("nickname")
    .where("nickname", "in", nicknames)
    .execute()

  return { ok: true, updated: query.length }
}

async function muteUsers(nicknames: SchemaControl["targets"]): Promise<ControlPayload> {
  const query = await general
    .updateTable("players")
    .set({})
    .where("nickname", "in", nicknames)
    .returning("nickname")
    .execute()

  return { ok: true, updated: query.length }
}

async function notifyUsers(nicknames: SchemaControl["targets"]): Promise<ControlPayload> {
  return { ok: true, updated: 0 }
}

async function unloginUsers(nicknames: SchemaControl["targets"]): Promise<ControlPayload> {
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
  { targets, type }: SchemaControl
) {
  const TARGETS_EVENTS: Record<SchemaControl["type"], (targets: SchemaControl["targets"]) => Promise<ControlPayload>> = {
    ban: (targets) => banUsers(targets),
    mute: (targets) => muteUsers(targets),
    notify: (targets) => notifyUsers(targets),
    unlogin: (targets) => unloginUsers(targets),
  }

  const event = TARGETS_EVENTS[type];

  return event(targets)
}

export const usersControlRolesSchema = z.object({
  type: z.enum(["change_role", "reset"]),
  targets: usersControlTargetsSchema,
  targetRoleId: z.coerce.number()
})
