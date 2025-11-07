import { client, withAbort, withJsonBody, withQueryParams } from "@/shared/lib/client-wrapper"
import { logError } from "@/shared/lib/log"
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async"
import { action, atom, batch, Ctx } from "@reatom/core"
import { reatomSet, sleep, withConcurrency, withReset } from "@reatom/framework"
import { withLocalStorage } from "@reatom/persist-web-storage"
import { PrivatedUsersPayload } from "@repo/shared/types/entities/other"
import { toast } from "sonner"
import { notifyAboutRestrictRole } from "./actions.model"

type UsersSort = "created_at" | "role" | "abc"
type ControlPayload = { ok: boolean, updated: number }
type UsersControlPunishType = "ban" | "mute" | "unlogin" | "notify"
type UsersControlRolesType = "change_role" | "reset"

type Params = {
  searchQuery: string | undefined;
  asc: boolean;
  sort: UsersSort;
  startCursor: Maybe<string>;
  endCursor: Maybe<string>;
}

export const usersSearchQueryAtom = atom<Maybe<string>>(undefined, "usersSearchQuery")
export const usersAscendingAtom = atom(false, "usersAscending").pipe(withLocalStorage({ key: "privated-users-asc" }))
export const usersSortAtom = atom<UsersSort>("created_at", "usersSort").pipe(withLocalStorage({ key: "privated-users-sort" }))

export const usersControlTargetsAtom = reatomSet<string>([], "usersControlTargets").pipe(withReset())
export const usersControlTargetRoleIdAtom = atom<number | null>(null, "usersControlTargetRoleId").pipe(withReset())

const usersStartCursorAtom = atom<Maybe<string>>(undefined).pipe(withReset())
const usersEndCursorAtom = atom<Maybe<string>>(undefined).pipe(withReset())

usersSortAtom.onChange((ctx) => refetchUsersAction(ctx))
usersAscendingAtom.onChange((ctx) => refetchUsersAction(ctx))

export const updateSearchQueryAction = action(async (ctx, e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  usersSearchQueryAtom(ctx, value)

  await ctx.schedule(() => sleep(300))

  refetchUsersAction(ctx)
}, "updateSearchQueryAction").pipe(withConcurrency())

export const usersDataAtom = atom<PrivatedUsersPayload["data"] | null>(null, "usersData")
export const usersMetaAtom = atom<PrivatedUsersPayload["meta"] | null>(null, "usersMeta")

async function getUsers(params: Params) {
  return client<PrivatedUsersPayload>("privated/user/list")
    .pipe(withQueryParams(params))
    .exec()
}

function getParams(ctx: Ctx) {
  return {
    searchQuery: ctx.get(usersSearchQueryAtom),
    asc: ctx.get(usersAscendingAtom),
    sort: ctx.get(usersSortAtom),
    startCursor: ctx.get(usersStartCursorAtom),
    endCursor: ctx.get(usersEndCursorAtom)
  }
}

export const usersAction = reatomAsync(async (ctx) => {
  const params = getParams(ctx)
  return await ctx.schedule(() => getUsers(params))
}, {
  name: "usersAction",
  onFulfill: (ctx, res) => {
    batch(ctx, () => {
      usersDataAtom(ctx, res.data)
      usersMetaAtom(ctx, res.meta)
    })
  },
  onReject: (_, e) => {
    notifyAboutRestrictRole(e)
    logError(e)
  }
}).pipe(withStatusesAtom(), withCache({ swr: false }))

export const usersControlRestrictAction = reatomAsync(async (ctx, type: UsersControlPunishType) => {
  const targets = [...ctx.get(usersControlTargetsAtom)]

  type BodyPayload = { type: UsersControlPunishType, targets: string[] }

  const body: BodyPayload = { type, targets }

  const result = await ctx.schedule(() =>
    client
      .post<ControlPayload>("privated/user/restrict/create")
      .pipe(withJsonBody(body))
      .exec()
  )

  return { targets, result }
}, {
  name: "usersControlPunishAction",
  onFulfill: (ctx, res) => {
    if (!res) return;

    const { targets, result } = res;

    if (!result.ok) {
      toast.error("Is not updated")
      return;
    }

    if (targets.length <= 2) {
      const toUpdate = [
        { key: "status", value: "banned" }
      ]

      updateUsersData(ctx, targets, toUpdate)
    } else {
      refetchUsersAction(ctx)
    }

    usersControlTargetsAtom.reset(ctx)
  },
  onReject: (ctx, e) => {
    notifyAboutRestrictRole(e)
    usersControlTargetsAtom.reset(ctx)
    logError(e)
  }
}).pipe(withStatusesAtom())

export const usersControlRestrictTypeAtom = atom<UsersControlPunishType | null>(null, "usersControlRestrictType").pipe(withReset())

export const usersControlPunishBeforeAction = action((
  ctx,
  nicknames: string[],
) => {
  const type = ctx.get(usersControlRestrictTypeAtom)
  if (!type) throw new Error("Restrict type is not defined")

  for (const nickname of nicknames) {
    usersControlTargetsAtom.add(ctx, nickname);
  }

  usersControlRestrictAction(ctx, type)
}, "usersControlPunishBeforeAction")

export const usersControlRolesBeforeAction = action((
  ctx,
  nicknames: string[],
  { type }: { type: UsersControlRolesType }
) => {
  for (const nickname of nicknames) {
    usersControlTargetsAtom.add(ctx, nickname);
  }

  const targetRoleId = ctx.get(usersControlTargetRoleIdAtom)
  if (!targetRoleId) {
    throw new Error("Target role id is not defined")
  }

  usersControlRolesAction(ctx, type, targetRoleId)
}, "usersControlRolesBeforeAction")

export const usersControlRolesAction = reatomAsync(async (
  ctx,
  type: UsersControlRolesType,
  targetRoleId: number
) => {
  const targets = [...ctx.get(usersControlTargetsAtom)]

  type BodyPayload = { type: UsersControlRolesType, targetRoleId: number, targets: string[] }

  const body: BodyPayload = { type, targets, targetRoleId }

  const result = await ctx.schedule(() =>
    client.post<ControlPayload>("privated/user/roles")
      .pipe(withJsonBody(body))
      .exec()
  )

  return { targets, targetRoleId, result }
}, {
  name: "usersControlRolesAction",
  onFulfill: (ctx, res) => {
    if (!res) return;

    const { result, targets, targetRoleId } = res;

    if (!result.ok) {
      toast.error("Is not updated")
      return;
    }

    if (targets.length <= 2) {
      const targetRoleName = ctx.get(rolesAction.dataAtom)?.find(role => role.id === targetRoleId)?.name;
      if (!targetRoleName) throw new Error("Target role name is not defined")

      const toUpdate = [
        { key: "role_id", value: targetRoleId },
        { key: "role_name", value: targetRoleName }
      ]

      updateUsersData(ctx, targets, toUpdate)
    } else {
      refetchUsersAction(ctx)
    }

    resetControlRoles(ctx)
  },
  onReject: (ctx, e) => {
    notifyAboutRestrictRole(e)
    logError(e)
    resetControlRoles(ctx)
  }
}).pipe(withStatusesAtom())

export type Role = {
  name: string,
  id: number
}

export const rolesAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(() =>
    client<Role[]>("privated/role/list")
      .pipe(withAbort(ctx.controller.signal))
      .exec()
  )
}, {
  name: "rolesAction",
  onReject: (ctx, e) => {
    notifyAboutRestrictRole(e)
    logError(e)
  }
}).pipe(withDataAtom(), withCache({ swr: false }), withStatusesAtom())

export const getIsCheckedAtom = (nickname: string) => atom(
  (ctx) => ctx.spy(usersControlTargetsAtom).has(nickname),
  "getIsChecked"
)

export const selectUserAction = action((ctx, value: boolean, nickname: string) => {
  if (value) {
    usersControlTargetsAtom.add(ctx, nickname)
  } else {
    usersControlTargetsAtom.delete(ctx, nickname)
  }
}, "selectUserAction")

export const usersLengthAtom = atom((ctx) => ctx.spy(usersDataAtom)?.length ?? 0, "usersLength")
export const usersSelectedLengthAtom = atom((ctx) => ctx.spy(usersControlTargetsAtom).size ?? 0, "usersLength")

export const isCheckedAllAtom = atom(false, "isCheckedAll").pipe(withReset())

export const selectAllAction = action((ctx, value: boolean) => {
  if (value) {
    const users = ctx.get(usersDataAtom);
    if (!users) throw new Error("Users is not defined")

    const nicknames = users.map((user) => user.nickname)

    batch(ctx, () => {
      usersControlTargetsAtom(ctx, new Set(nicknames))
      isCheckedAllAtom(ctx, true);
    })
  } else {
    batch(ctx, () => {
      usersControlTargetsAtom.reset(ctx)
      isCheckedAllAtom.reset(ctx)
    })
  }
}, "selectAllAction")

function resetControlRoles(ctx: Ctx) {
  usersControlTargetsAtom.reset(ctx)
  usersControlTargetRoleIdAtom.reset(ctx)
}

function refetchUsersAction(ctx: Ctx) {
  resetCursors(ctx)
  usersAction.cacheAtom.reset(ctx)
  usersAction(ctx);
}

function updateUsersData(
  ctx: Ctx,
  nicknames: string[],
  updates: { key: string, value: string | number | boolean }[]
) {
  usersAction.cacheAtom.reset(ctx);

  usersDataAtom(ctx, (state) => {
    if (!state) return null;

    const results = updates.reduce<Record<string, string | number | boolean>>(
      (acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {}
    );

    const newData = state.map((item) => {
      const targets = nicknames.includes(item.nickname)

      return targets
        ? { ...item, ...results }
        : item
    });

    return newData
  })
}

export const usersIsViewAtom = atom(false, "usersIsView")

export const updateAction = reatomAsync(async (ctx) => {
  const params = getParams(ctx);
  return await ctx.schedule(() => getUsers(params))
}, {
  name: "updateAction",
  onFulfill: (ctx, res) => {
    batch(ctx, () => {
      usersDataAtom(ctx, (state) => state ? [...state, ...res.data] : null)
      usersMetaAtom(ctx, res.meta)
    })
  },
  onReject: (_, e) => {
    notifyAboutRestrictRole(e)
    logError(e)
  }
}).pipe(withStatusesAtom())

function resetCursors(ctx: Ctx) {
  usersEndCursorAtom.reset(ctx)
  usersStartCursorAtom.reset(ctx)
}

usersIsViewAtom.onChange((ctx, state) => {
  if (!state) return;

  const meta = ctx.get(usersMetaAtom)
  const endCursor = meta?.endCursor
  const hasNextPage = meta?.hasNextPage

  if (hasNextPage) {
    usersEndCursorAtom(ctx, endCursor)
    updateAction(ctx)
  }
})

export const usersSelectedOverAtom = atom(
  (ctx) => ctx.spy(usersSelectedLengthAtom) >= 2,
  "usersSelectedOver"
)

export const userActionsChangeRoleDropdownMenuIsOpenAtom = atom(false, "userActionsChangeRoleDropdownMenuIsOpen")

usersControlRolesAction.onFulfill.onCall((ctx, res) => {
  userActionsChangeRoleDropdownMenuIsOpenAtom(ctx, false)
})

userActionsChangeRoleDropdownMenuIsOpenAtom.onChange((ctx, state) => {
  if (!state) {
    usersControlTargetRoleIdAtom.reset(ctx)
  }
})

export const userActionsRestrictDropdownMenuIsOpenAtom = atom(false, "userActionsRestrictDropdownMenuIsOpen")

userActionsRestrictDropdownMenuIsOpenAtom.onChange((ctx, state) => {
  if (!state) {
    usersControlRestrictTypeAtom.reset(ctx)
  }
})