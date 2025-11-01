import { currentUserAtom } from "@/shared/models/current-user.model";
import { reatomComponent } from "@reatom/npm-react";
import { Button } from "@repo/ui/button";
import { Typography } from "@repo/ui/typography";
import { logoutAction } from "../../auth/models/auth.model";
import { spawn } from "@reatom/framework";

export const Logout = reatomComponent(({ ctx }) => {
  const currentUser = ctx.spy(currentUserAtom)
  if (!currentUser) return null;

  const handle = () => void spawn(ctx, async (spawnCtx) => logoutAction(spawnCtx))

  return (
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
  )
}, "Logout")