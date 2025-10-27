import { reatomComponent, useUpdate } from "@reatom/npm-react"
import type { RolePayload } from "@repo/shared/types/entities/role"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@repo/ui/dropdown-menu"
import { Skeleton } from "@repo/ui/skeleton"
import { Typography } from "@repo/ui/typography"
import { Button } from "@repo/ui/button"
import { AddButton, DeleteButton, EditButton } from "./ui"
import { tv } from "tailwind-variants"
import { IconPlus } from "@tabler/icons-react"
import {
  addDeletedPermAction,
  addDeletedPermRoleAction,
  addNewPermAction,
  deletedPermIsSelectedAtom,
  deleteNewPermAction,
  permIsSelectedAtom,
  permissionsByRoleListAction,
  roleAvailablePermsAtom,
  roleDeletedPermsAtom,
  roleEditableAtom,
  roleIsSelectedRoleAtom,
  roleNewPermsAtom,
  rolesIsEditableAtom,
  rolesListAction,
  saveChangesAction,
  saveChangesIsValidAtom,
  toggleRoleEditAction
} from "../models/roles.model"
import { appDictionariesAtom } from "@/shared/models/app.model"

const rolesListPermItemVariant = tv({
  base: `
    flex items-center group
    data-[state=active]:bg-green-500/60 
    data-[state=inactive]:bg-transparent
    data-[state=deleted]:bg-red-500/60
    border border-neutral-800 px-2 py-1 rounded-lg justify-between w-full gap-2
  `,
  slots: {
    name: `
      text-base 
      group-data-[state=active]:text-neutral-50 
      group-data-[state=inactive]:text-neutral-50
      group-data-[state=deleted]:text-neutral-50
    `,
    id: "flex items-center justify-center h-6 min-w-6 aspect-auto w-fit bg-neutral-700 rounded-sm p-1"
  }
})

const RolesListItemPermsItemSkeleton = () => {
  return (
    <div className={rolesListPermItemVariant().base()}>
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-6" />
      </div>
      <Skeleton className="h-6 w-6" />
    </div>
  )
}

const RolesListItemPermsItem = reatomComponent<RolePayload>(({ ctx, id, name }) => {
  const selected = ctx.spy(deletedPermIsSelectedAtom(id));

  return (
    <div
      className={rolesListPermItemVariant().base()}
      data-state={selected ? "deleted" : "inactive"}
    >
      <div className="flex items-center gap-2">
        <Typography className={rolesListPermItemVariant().name()}>
          {name}
        </Typography>
        <div className={rolesListPermItemVariant().id()}>
          <span>{id}</span>
        </div>
      </div>
      {selected
        ? <AddButton onClick={() => addDeletedPermRoleAction(ctx, id)} />
        : <DeleteButton onClick={() => addDeletedPermAction(ctx, { id, name })} />
      }
    </div>
  )
}, "RolesListItemPermsItem")

const RolesListItemNewPermsItem = reatomComponent<RolePayload>(({ ctx, id, name }) => {
  const selected = ctx.spy(permIsSelectedAtom(id))

  return (
    <div className={rolesListPermItemVariant().base()} data-state="active">
      <div className="flex items-center gap-2">
        <Typography className={rolesListPermItemVariant().name()}>
          {name}
        </Typography>
        <div className={rolesListPermItemVariant().id()}>
          <span>{id}</span>
        </div>
      </div>
      {selected
        ? <DeleteButton onClick={() => deleteNewPermAction(ctx, id)} />
        : <AddButton onClick={() => addNewPermAction(ctx, { id, name })} />
      }
    </div>
  )
}, "RolesListItemNewPermsItem")

const RolesListItemPermsSkeleton = () => {
  return (
    <>
      <RolesListItemPermsItemSkeleton />
      <RolesListItemPermsItemSkeleton />
      <RolesListItemPermsItemSkeleton />
      <RolesListItemPermsItemSkeleton />
    </>
  )
}

const RolesListItemPerms = reatomComponent(({ ctx }) => {
  const id = ctx.spy(roleEditableAtom)?.id
  const data = ctx.spy(permissionsByRoleListAction.dataAtom)

  useUpdate((ctx) => id && permissionsByRoleListAction(ctx, id), [id])

  if (ctx.spy(permissionsByRoleListAction.statusesAtom).isPending) {
    return <RolesListItemPermsSkeleton />
  }

  if (!data) return <span>пусто</span>

  return data.permissions.map((p) => <RolesListItemPermsItem key={p.id} {...p} />)
}, "RolesListItemPerms")


const RolesListItemAvailableItem = reatomComponent<RolePayload>(({ ctx, id, name }) => {
  const selected = ctx.spy(permIsSelectedAtom(id))

  return (
    <div
      className={rolesListPermItemVariant().base()}
      data-state={selected ? "active" : "inactive"}
    >
      <div className="flex items-center gap-2">
        <Typography className={rolesListPermItemVariant().name()}>
          {name}
        </Typography>
        <div className={rolesListPermItemVariant().id()}>
          {id}
        </div>
      </div>
      {!selected && <AddButton onClick={() => addNewPermAction(ctx, { id, name })} />}
    </div>
  )
}, "RolesListItemAvailableItem")

const RolesListItemSaveChanges = reatomComponent(({ ctx }) => {
  const isDisabled = !ctx.spy(saveChangesIsValidAtom) || ctx.spy(saveChangesAction.statusesAtom).isPending

  return (
    <Button
      className="bg-neutral-50 w-full sm:w-2/3 text-neutral-950 font-semibold text-lg"
      onClick={() => saveChangesAction(ctx)}
      disabled={isDisabled}
    >
      Сохранить
    </Button>
  )
}, "RolesListItemSaveChanges")

const RolesListItemAddPerm = reatomComponent(({ ctx }) => {
  const id = ctx.spy(roleEditableAtom)?.id
  if (!id) return null;

  const availablePerms = ctx.spy(roleAvailablePermsAtom)

  const isDisabled = availablePerms.length === 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={isDisabled} asChild>
        <Button className="gap-2 font-semibold text-lg w-full sm:w-fit grow bg-neutral-900">
          Добавить
          <IconPlus size={18} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right">
        <div className="flex flex-col gap-2 p-2 w-full h-fit">
          <Typography className="text-neutral-400 text-sm">
            Доступные разрешения
          </Typography>
          <div className="flex flex-col scrollbar scrollbar-thumb-neutral-800 gap-1 max-h-[200px] overflow-y-auto w-full">
            {availablePerms.map((permission) => (
              <RolesListItemAvailableItem key={permission.id} {...permission} />
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}, "RolesListItemAddPerm")

const rolesListItemVariant = tv({
  base: `flex items-center justify-between w-full gap-1 border border-neutral-800 rounded-lg p-2`,
  slots: {
    group: `flex items-center justify-center gap-2`,
  }
})

const RolesListItemSkeleton = () => {
  return (
    <div className={rolesListItemVariant().base()}>
      <div className={rolesListItemVariant().group()}>
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="h-6 w-6" />
    </div>
  )
}

const RolesListItem = reatomComponent<RolePayload>(({ ctx, id, name }) => {
  const selected = ctx.spy(roleIsSelectedRoleAtom(id));

  const title = appDictionariesAtom.get(ctx, name)

  return (
    <div className={rolesListItemVariant().base()}>
      <div className={rolesListItemVariant().group()}>
        <div className="flex items-center bg-neutral-800 rounded-sm justify-center h-6 min-w-6 p-1">
          {id}
        </div>
        <Typography>{title}</Typography>
      </div>
      <EditButton
        className={selected ? "bg-neutral-50 text-neutral-950" : ""}
        onClick={() => toggleRoleEditAction(ctx, { id, name })}
      />
    </div>
  )
}, "RolesListItem")

const RolesListSkeleton = () => {
  return (
    <>
      <RolesListItemSkeleton />
      <RolesListItemSkeleton />
      <RolesListItemSkeleton />
    </>
  )
}

const RolesList = reatomComponent(({ ctx }) => {
  useUpdate(rolesListAction, []);

  const data = ctx.spy(rolesListAction.dataAtom)

  if (ctx.spy(rolesListAction.statusesAtom).isPending) {
    return <RolesListSkeleton />
  }

  if (!data) return null;

  return data.map((role) => <RolesListItem key={role.id} {...role} />)
}, "RolesList")

const RolesListItemNewPerms = reatomComponent(({ ctx }) => {
  const data = ctx.spy(roleNewPermsAtom);
  if (data.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 w-full h-fit">
      {data.map((p) => <RolesListItemNewPermsItem key={p.id} {...p} />)}
    </div>
  )
}, "RolesListItemNewPerms")

const RolesEditableRoleName = reatomComponent(
  ({ ctx }) => ctx.spy(roleEditableAtom)?.name ?? null,
  "RolesEditableRoleName"
)

const RolesEditablePermHeader = reatomComponent(({ ctx }) => {
  return (
    <div className="flex flex-col">
      <Typography className="text-neutral-50 text-base">
        Текущие разрешения
      </Typography>
      <div className="flex items-center gap-2  text-neutral-400 text-sm">
        <Typography>
          всего: {ctx.spy(permissionsByRoleListAction.dataAtom)?.permissions.length ?? 0}
        </Typography>
        <Typography>
          на добавление: {ctx.spy(roleNewPermsAtom).length}
        </Typography>
        <Typography>
          на удаление: {ctx.spy(roleDeletedPermsAtom).length}
        </Typography>
      </div>
    </div>
  )
}, "RolesEditablePermHeader")

const RolesEditable = reatomComponent(({ ctx }) => {
  if (!ctx.spy(rolesIsEditableAtom)) return null;

  return (
    <div className="flex flex-col h-fit w-full sm:w-1/2 gap-2 bg-neutral-900/40 rounded-xl p-4">
      <div className="flex items-center justify-between w-full gap-1">
        <Typography className="text-xl font-semibold">
          Редактирование роли <RolesEditableRoleName />
        </Typography>
      </div>
      <div className="flex flex-col gap-2">
        <RolesEditablePermHeader />
        <div
          className="flex flex-col gap-1
            scrollbar scrollbar-thumb-neutral-800 max-h-[200px] 
            bg-neutral-900 rounded-lg p-1 overflow-y-auto h-fit"
        >
          <RolesListItemPerms />
          <RolesListItemNewPerms />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
        <RolesListItemAddPerm />
        <RolesListItemSaveChanges />
      </div>
    </div>
  )
}, "RolesEditable")

export const Roles = () => {
  return (
    <div className="flex flex-col sm:flex-row items-start w-full gap-4 justify-between">
      <div className="flex flex-col gap-2 h-fit w-full sm:w-fit grow">
        <RolesList />
      </div>
      <RolesEditable />
    </div>
  )
}