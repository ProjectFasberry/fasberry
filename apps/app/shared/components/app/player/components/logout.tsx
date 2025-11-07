import { currentUserAtom } from "@/shared/models/current-user.model";
import { reatomComponent } from "@reatom/npm-react";
import { Button } from "@repo/ui/button";
import { Typography } from "@repo/ui/typography";
import { beforeLogoutAction, logoutAction } from "../../auth/models/logout.model";
import { AlertDialog } from "@/shared/components/config/alert-dialog";

export const Logout = reatomComponent(({ ctx }) => {
  const currentUser = ctx.spy(currentUserAtom)
  if (!currentUser) return null;

  const handle = () => beforeLogoutAction(ctx)

  return (
    <>
      <AlertDialog />
      <div className="flex items-center justify-between w-full">
        <Typography color="white" className="text-2xl font-semibold">
          Сессия
        </Typography>
        <Button
          disabled={ctx.spy(logoutAction.statusesAtom).isPending}
          onClick={handle}
          className="bg-neutral-50 w-fit"
        >
          <Typography className="text-red-500 font-semibold">
            Выйти из аккаунта
          </Typography>
        </Button>
      </div>
    </>
  )
}, "Logout")