import { Avatar } from "@/shared/components/app/avatar/components/avatar"
import {
  checkedStatusAtom,
  isCheckedAllAtom,
  Role as RoleType,
  rolesAction,
  selectAllAction,
  selectUserAction,
  updateSearchQueryAction,
  usersAction,
  usersAscendingAtom,
  usersControlPunishAction,
  usersControlPunishBeforeAction,
  usersControlRolesBeforeAction,
  usersControlTargetRoleIdAtom,
  usersLengthAtom,
  usersSearchQueryAtom,
  usersSortAtom,
  userInfoAction,
  usersLimitAtom,
  applyLimitAction,
  usersSelectedLengthAtom,
  usersDataAtom,
  usersIsViewAtom,
  updateAction,
  resetUserInfo
} from "@/shared/components/app/private/models/users.model"
import { createLink, Link } from "@/shared/components/config/link"
import { startPageEvents } from "@/shared/lib/events"
import { currentUserAtom } from "@/shared/models/current-user.model"
import { pageContextAtom } from "@/shared/models/global.model"
import { action, atom } from "@reatom/core"
import { reatomComponent, useUpdate } from "@reatom/npm-react"
import { PrivatedUser } from "@repo/shared/types/entities/other"
import { Button } from "@repo/ui/button"
import { Checkbox } from "@repo/ui/checkbox"
import { Dialog, DialogContent, DialogTitle } from "@repo/ui/dialog"
import { Input } from "@repo/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/popover"
import { Skeleton } from "@repo/ui/skeleton"
import { Typography } from "@repo/ui/typography"
import { IconArrowDown, IconArrowUp, IconBan, IconDotsVertical, IconEyeFilled } from "@tabler/icons-react"
import dayjs from "@/shared/lib/create-dayjs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@repo/ui/tooltip"
import { Slider } from "@repo/ui/slider"
import { useState } from "react"
import { useInView } from "react-intersection-observer"

type RoleProps = RoleType & {
  onClick: (id: number) => void
}

const Role = ({ name, id, onClick }: RoleProps) => {
  return (
    <div
      key={id}
      onClick={() => onClick(id)}
      className="flex items-center justify-start hover:bg-neutral-700 h-10 bg-neutral-800 rounded-lg px-2 cursor-pointer"
    >
      <Typography>
        {id} - {name}
      </Typography>
    </div>
  )
}

const RolesSkeleton = () => {
  return (
    <div className="flex flex-col gap-1 w-full h-full">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

const Roles = reatomComponent<Pick<RoleProps, "onClick">>(({ ctx, onClick }) => {
  const data = ctx.spy(rolesAction.dataAtom)

  if (ctx.spy(rolesAction.statusesAtom).isPending) {
    return <RolesSkeleton />;
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-1 w-full h-full">
      {data.map((role) => (
        <Role key={role.id} {...role} onClick={onClick} />
      ))}
    </div>
  )
}, "Roles")

type UserActionsProps = {
  nickname: string,
  role: { role_id: number, role_name: string }
}

const USER_ACTIONS = [
  { title: "Бан", type: "ban", },
  { title: "Мут", type: "mute", },
  { title: "Выйти из сессии", type: "unlogin", }
] as const

const userInfoDialogIsOpenAtom = atom(false, "userInfoDialogIsOpen")

const handleInfoDialogAction = action(async (ctx, value: boolean) => {
  if (!value) {
    resetUserInfo(ctx)
  }

  userInfoDialogIsOpenAtom(ctx, value)
}, "handleInfoDialogAction")

const UserInfoDialog = reatomComponent(({ ctx }) => {
  return (
    <Dialog open={ctx.spy(userInfoDialogIsOpenAtom)} onOpenChange={v => handleInfoDialogAction(ctx, v)}>
      <DialogContent>
        <DialogTitle className="hidden">Информация</DialogTitle>
        <UserInfo />
      </DialogContent>
    </Dialog>
  )
}, "UserInfoDialog")

const UserInfo = reatomComponent(({ ctx }) => {
  const data = ctx.spy(userInfoAction.dataAtom);

  if (ctx.spy(userInfoAction.statusesAtom).isPending) {
    return (
      <div className="flex flex-col gap-1 w-full h-full">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  if (!data) return null;

  return (
    <div className="flex flex-col items-start gap-1 w-full h-full">
      <div className="flex items-center justify-center w-full h-full">
        <Avatar
          nickname={data.nickname}
          propWidth={64}
          propHeight={64}
        />
      </div>
      <Typography className="text-lg">
        ID: {data.id}
      </Typography>
      <Typography className="text-lg">
        Никнейм: {data.nickname} ({data.lower_case_nickname})
      </Typography>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Typography className="text-lg">
              Регистрация: {dayjs(data.created_at).fromNow()}
            </Typography>
          </TooltipTrigger>
          <TooltipContent>
            {dayjs(data.created_at).format("DD.MM.YYYY hh:mm")}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Typography className="text-lg">
        UUID: {data.uuid}
      </Typography>
      <Typography className="text-lg">
        Premium UUID: {data.premium_uuid}
      </Typography>
      <Typography className="text-lg">
        Роль: {data.role_name} {data.role_id}
      </Typography>
    </div>
  )
}, "UserInfo")

const openUserInfoDialogAction = action((ctx, nickname: string) => {
  userInfoDialogIsOpenAtom(ctx, true);
  userInfoAction(ctx, nickname);
}, "openUserInfoDialogAction")

const UsersGlobalActions = reatomComponent(({ ctx }) => {
  const isSelectedOver = ctx.spy(usersSelectedOverAtom);
  if (!isSelectedOver) return null;

  return (
    <div className="flex items-center justify-center gap-1">
      <Popover modal={true}>
        <PopoverTrigger>
          <div className="flex items-center justify-center h-8 w-8 aspect-square bg-neutral-800 rounded-md">
            <IconBan size={16} />
          </div>
        </PopoverTrigger>
        <PopoverContent>
          <div className="flex flex-col gap-1 w-full h-full">
            {USER_ACTIONS.map((action) => (
              <Button
                key={action.type}
                className="flex hover:bg-neutral-700 justify-start bg-neutral-800 text-red-500"
                onClick={() => usersControlPunishBeforeAction(ctx, [], { type: action.type })}
                disabled={ctx.spy(usersControlPunishAction.statusesAtom).isPending}
              >
                {action.title}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <Popover modal={true}>
        <PopoverTrigger onClick={() => rolesAction(ctx)}>
          <div className="flex items-center justify-center h-8 w-8 aspect-square bg-neutral-800 rounded-md">
            <IconDotsVertical size={16} />
          </div>
        </PopoverTrigger>
        <PopoverContent>
          <div className="flex flex-col gap-1 w-full h-full">
            <Roles
              onClick={(roleId) => {
                usersControlTargetRoleIdAtom(ctx, roleId);
                usersControlRolesBeforeAction(ctx, [], { type: "change_role" });
              }}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}, "UsersGlobalActions")

const UserActions = reatomComponent<UserActionsProps>(({ ctx, role, nickname }) => {
  const isSelectedOver = ctx.spy(usersSelectedOverAtom);
  if (isSelectedOver) return null;

  return (
    <>
      <Popover modal={true}>
        <PopoverTrigger>
          <div className="flex items-center justify-center h-8 w-8 aspect-square bg-neutral-800 rounded-md">
            <IconBan size={16} />
          </div>
        </PopoverTrigger>
        <PopoverContent>
          <div className="flex flex-col gap-1 w-full h-full">
            {USER_ACTIONS.map((action) => (
              <Button
                key={action.type}
                className="flex hover:bg-neutral-700 justify-start bg-neutral-800 text-red-500"
                onClick={() => usersControlPunishBeforeAction(ctx, [nickname], { type: action.type })}
                disabled={ctx.spy(usersControlPunishAction.statusesAtom).isPending}
              >
                {action.title}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <Popover modal={true}>
        <PopoverTrigger onClick={() => rolesAction(ctx)}>
          <div className="flex items-center justify-center h-8 w-8 aspect-square bg-neutral-800 rounded-md">
            <IconDotsVertical size={16} />
          </div>
        </PopoverTrigger>
        <PopoverContent>
          <div className="flex flex-col gap-1 w-full h-full">
            <Typography className='text-neutral-300'>
              Текущая роль: {role.role_name} ({role.role_id})
            </Typography>
            <Roles
              onClick={(roleId) => {
                usersControlTargetRoleIdAtom(ctx, roleId);
                usersControlRolesBeforeAction(ctx, [nickname], { type: "change_role" });
              }}
            />
          </div>
        </PopoverContent>
      </Popover>
    </>
  )
}, "UserActions")

const User = reatomComponent<PrivatedUser>(({ ctx, id, nickname, role_name, role_id }) => {
  const currentUser = ctx.get(currentUserAtom)
  if (!currentUser) return null;

  const isChecked = ctx.spy(checkedStatusAtom(nickname))

  return (
    <div key={id} className="flex gap-2 rounded-lg bg-neutral-900 items-center justify-between px-4 w-full h-12">
      <div className="flex items-center gap-3 min-w-0  justify-start">
        <Checkbox
          checked={isChecked}
          onCheckedChange={v => typeof v === 'boolean' && selectUserAction(ctx, v, nickname)}
        />
        <Link href={createLink("player", nickname)} className="flex items-center min-w-0 gap-2">
          <Avatar nickname={nickname} propHeight={32} propWidth={32} />
          <Typography className="font-semibold truncate">
            {nickname}
          </Typography>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {currentUser.nickname === nickname &&
          <Typography className="hidden sm:inline font-semibold text-green-500 text-sm">вы</Typography>
        }
        <div className="flex items-center justify-center gap-1">
          <div
            onClick={() => openUserInfoDialogAction(ctx, nickname)}
            className="flex items-center justify-center h-8 w-8 aspect-square bg-neutral-800 rounded-md"
          >
            <IconEyeFilled size={16} />
          </div>
          <UserActions nickname={nickname} role={{ role_id, role_name }} />
        </div>
      </div>
    </div>
  )
}, "User")

const UsersSkeleton = () => {
  return (
    <div className="flex flex-col gap-1 w-full h-full">
      {Array.from({ length: 32 }).map((_, idx) => (
        <Skeleton key={idx} className="h-12 w-full" />
      ))}
    </div>
  )
}

const UsersUpdatingSkeleton = reatomComponent(({ ctx }) => {
  const isLoading = ctx.spy(updateAction.statusesAtom).isPending;
  if (!isLoading) return null;

  return (
    <>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </>
  )
}, "UsersUpdatingSkeleton")

const Users = reatomComponent(({ ctx }) => {
  const data = ctx.spy(usersDataAtom);

  if (ctx.spy(usersAction.statusesAtom).isPending) {
    return <UsersSkeleton />
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-1 w-full h-full">
      {data.map((user) => <User key={user.id} {...user} />)}
      <UsersUpdatingSkeleton />
    </div>
  )
}, "Users")

const events = action((ctx) => {
  usersAction(ctx)
}, "events")

const usersSelectedOverAtom = atom((ctx) => {
  return ctx.spy(usersSelectedLengthAtom) >= 2
})

const UsersSelectedLength = reatomComponent(({ ctx }) => {
  if (!ctx.spy(usersSelectedOverAtom)) return null;

  const data = ctx.spy(usersSelectedLengthAtom)
  if (data < 2) return null;

  return (
    <div className="flex items-center gap-1">
      <Typography>
        Выбрано:
      </Typography>
      {data}
    </div>
  )
})

const UsersFiltersLength = reatomComponent(({ ctx }) => {
  const isLoading = ctx.spy(usersAction.statusesAtom).isPending;

  return (
    <div className="flex items-center gap-4 w-full">
      <div className="flex items-center gap-1">
        <Typography>
          Показано:
        </Typography>
        {isLoading ? <Skeleton className="h-5 w-5" /> : (
          <Typography>
            {ctx.spy(usersLengthAtom)}
          </Typography>
        )}
      </div>
      <UsersSelectedLength />
    </div>
  )
}, "UsersFiltersLength")

const UsersFiltersAsc = reatomComponent(({ ctx }) => {
  return (
    <Button
      className="h-8 w-8 aspect-square p-1 bg-neutral-800"
      onClick={() => usersAscendingAtom(ctx, (state) => !state)}
    >
      {ctx.spy(usersAscendingAtom) ? <IconArrowUp /> : <IconArrowDown />}
    </Button>
  )
}, 'UsersFiltersAsc')

const UsersFiltersSelect = reatomComponent(({ ctx }) => {
  const isChecked = ctx.spy(isCheckedAllAtom)

  return (
    <div className="flex justify-between h-10 w-full items-center">
      <div className="flex items-center px-4 gap-2 w-full">
        <Checkbox
          checked={isChecked}
          onCheckedChange={(v) => typeof v === 'boolean' && selectAllAction(ctx, v)}
        />
        <Typography className="cursor-pointer" onClick={() => selectAllAction(ctx, !isChecked)}>
          Выбрать все
        </Typography>
      </div>
      <UsersGlobalActions />
    </div>
  )
}, "UsersFiltersSelect")

const UsersFiltersSearchQuery = reatomComponent(({ ctx }) => {
  return (
    <Input
      value={ctx.spy(usersSearchQueryAtom) ?? ""}
      onChange={e => updateSearchQueryAction(ctx, e)}
      placeholder="Поиск по никнейму"
      maxLength={32}
      className="w-full sm:w-fit"
    />
  )
}, "UsersFiltersSearchQuery")

const SORTS = [
  { title: "По дате регистрации", value: "created_at" },
  { title: "По роли", value: "role" },
  { title: "По алфавиту", value: "abc" }
] as const

const UsersFiltersSort = reatomComponent(({ ctx }) => {
  const currentSort = ctx.spy(usersSortAtom);
  const targetSort = SORTS.find(d => d.value === currentSort)?.title

  if (!targetSort) {
    return null;
  }

  return (
    <div>
      <Popover>
        <PopoverTrigger className="cursor-pointer bg-neutral-800 rounded-md h-8 px-4">
          {targetSort}
        </PopoverTrigger>
        <PopoverContent>
          <div className="flex flex-col gap-1 w-full h-full">
            {SORTS.map((sort) => (
              <div
                key={sort.value}
                className="flex cursor-pointer hover:bg-neutral-700 items-center px-2 py-1 justify-start w-full h-10 bg-neutral-800 rounded-lg"
                onClick={() => usersSortAtom(ctx, sort.value)}
              >
                <div className="flex">
                  {sort.title}
                </div>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}, "UsersFiltersSort")

const UsersLimit = reatomComponent(({ ctx }) => {
  const currentValue = ctx.spy(usersLimitAtom);
  const [value, setValue] = useState(currentValue);

  return (
    <Popover>
      <PopoverTrigger>
        <div className="flex justify-center items-center h-8 w-8 rounded-md aspect-square p-1 bg-neutral-800">
          <Typography>
            {currentValue}
          </Typography>
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col w-full h-full gap-2">
          <div className="flex items-center gap-2 w-full">
            <Typography>
              {value}
            </Typography>
            <Slider
              min={1}
              max={64}
              step={1}
              onValueChange={v => setValue(v[0])}
              value={[value]}
            />
          </div>
          <Button
            className="bg-neutral-50 text-neutral-950 text-lg"
            onClick={() => applyLimitAction(ctx, value)}
          >
            Применить
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}, "UsersLimit")

const UsersFilters = () => {
  return (
    <div className="flex flex-col w-full gap-2">
      <div className="flex items-center justify-start text-neutral-400 text-sm">
        <UsersFiltersLength />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-1 h-full">
        <div className="flex grow">
          <UsersFiltersSearchQuery />
        </div>
        <div className="flex justify-end sm:justify-start items-center gap-1 w-full sm:w-fit">
          <UsersFiltersAsc />
          <UsersLimit />
          <UsersFiltersSort />
        </div>
      </div>
      <UsersFiltersSelect />
    </div>
  )
}

const UsersViewer = () => {
  const { ref, inView } = useInView({ triggerOnce: false, threshold: 0 })
  useUpdate((ctx) => usersIsViewAtom(ctx, inView), [inView])
  return <div ref={ref} className="h-[1px]" />
}

export default function Page() {
  useUpdate((ctx) => startPageEvents(ctx, events), [pageContextAtom]);

  return (
    <>
      <UsersFilters />
      <Users />
      <UsersViewer />
      <>
        <UserInfoDialog />
      </>
    </>
  )
}