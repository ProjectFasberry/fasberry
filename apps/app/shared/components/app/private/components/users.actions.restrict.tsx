import { reatomComponent } from "@reatom/npm-react"
import {
  userActionsRestrictDropdownMenuIsOpenAtom,
  usersControlPunishBeforeAction,
  usersControlRestrictAction,
  usersControlRestrictTypeAtom
} from "../models/users.model"
import { Button } from "@repo/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@repo/ui/dropdown-menu"
import { IconBan } from "@tabler/icons-react"
import { Typography } from "@repo/ui/typography"
import { itemVariant } from "./ui"

const USER_ACTIONS = [
  { title: "Бан", type: "ban", },
  { title: "Мут", type: "mute", },
  { title: "Выйти из сессии", type: "unlogin", }
] as const

const UserActionsRestrictGlobalSubmit = reatomComponent(({ ctx }) => {
  const isDisabled = !ctx.spy(usersControlRestrictTypeAtom)
    || ctx.spy(usersControlRestrictAction.statusesAtom).isPending

  return (
    <Button
      className="bg-neutral-50 text-neutral-950 text-lg font-semibold"
      disabled={isDisabled}
      onClick={() => usersControlPunishBeforeAction(ctx, [])}
    >
      Применить
    </Button>
  )
}, "UserActionsRestrictGlobalSubmit")

const UserActionsRestrictSubmit = reatomComponent<{ nickname: string }>(({ ctx, nickname }) => {
  const isDisabled = !ctx.spy(usersControlRestrictTypeAtom)
    || ctx.spy(usersControlRestrictAction.statusesAtom).isPending

  return (
    <Button
      className="bg-neutral-50 text-neutral-950 text-lg font-semibold"
      disabled={isDisabled}
      onClick={() => usersControlPunishBeforeAction(ctx, [nickname])}
    >
      Применить
    </Button>
  )
}, "UserActionsRestrictSubmit")

export const UserActionsRestrictGlobal = reatomComponent(({ ctx }) => {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger>
        <div className="flex items-center justify-center h-8 w-8 aspect-square bg-neutral-800 rounded-md">
          <IconBan size={16} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className="flex flex-col gap-2 p-2 w-full h-full min-w-40">
          <Typography className="text-neutral-400">
            Доступные действия
          </Typography>
          <div className="flex flex-col gap-1 w-full h-full">
            {USER_ACTIONS.map((action) => (
              <Button
                key={action.type}
                className={itemVariant({
                  variant: ctx.spy(usersControlRestrictTypeAtom) === action.type ? "selected" : "default"
                })}
                onClick={() => usersControlRestrictTypeAtom(ctx, action.type)}
              >
                {action.title}
              </Button>
            ))}
          </div>
          <UserActionsRestrictGlobalSubmit />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}, "UserActionsRestrictGlobal")

export const UserActionsRestrictLocal = reatomComponent<{ nickname: string }>(({ ctx, nickname }) => {
  return (
    <DropdownMenu
      open={ctx.spy(userActionsRestrictDropdownMenuIsOpenAtom)}
      onOpenChange={v => userActionsRestrictDropdownMenuIsOpenAtom(ctx, v)}
      modal={false}
    >
      <DropdownMenuTrigger asChild>
        <Button className="p-0 h-6 w-6 aspect-square bg-neutral-800">
          <IconBan size={18} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className="flex flex-col gap-2 p-2 w-full h-full min-w-40">
          <Typography className="text-neutral-400">
            Доступные действия
          </Typography>
          <div className="flex flex-col gap-1 w-full h-full">
            {USER_ACTIONS.map((action) => (
              <Button
                key={action.type}
                className={itemVariant({
                  variant: ctx.spy(usersControlRestrictTypeAtom) === action.type ? "selected" : "default"
                })}
                onClick={() => usersControlRestrictTypeAtom(ctx, action.type)}
              >
                {action.title}
              </Button>
            ))}
          </div>
          <UserActionsRestrictSubmit nickname={nickname} />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}, "UserActionsRestrictLocal")