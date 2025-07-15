import { currentUserAtom } from "@/shared/models/current-user.model";
import { reatomComponent } from "@reatom/npm-react";
import { Button } from "@repo/ui/button";
import { Typography } from "@repo/ui/typography";
import { logout } from "../../auth/models/auth.model";
import { spawn } from "@reatom/framework";
import { isIdentityAtom } from "../models/player.model";

export const Logout = reatomComponent(({ ctx }) => {
  const currentUser = ctx.spy(currentUserAtom)
  if (!currentUser) return null;

  const isIdentity = ctx.spy(isIdentityAtom)

  if (!isIdentity) return null;

  const handle = () => void spawn(ctx, async (spawnCtx) => logout(spawnCtx))

  return (
    <div className="flex items-center justify-between w-full">
      <Typography color="white" className="text-2xl font-semibold">
        Сессия
      </Typography>
      <Button disabled={ctx.spy(logout.isLoading)} onClick={handle} className="bg-neutral-50 w-fit">
        <Typography className="text-neutral-950 font-semibold">
          Выйти из аккаунта
        </Typography>
      </Button>
    </div>
  )
}, "Logout")