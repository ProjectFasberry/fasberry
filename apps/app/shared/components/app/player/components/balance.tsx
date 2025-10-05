import { currentUserAtom } from "@/shared/models/current-user.model";
import { reatomComponent } from "@reatom/npm-react";
import { Typography } from "@repo/ui/typography";
import { isIdentityAtom } from "../models/player.model";
import { Button } from "@repo/ui/button";
import { Link } from "@/shared/components/config/link";

export const Balance = reatomComponent(({ ctx }) => {
  const isIdentity = ctx.spy(isIdentityAtom)
  if (!isIdentity) return null;
  
  const currentUser = ctx.spy(currentUserAtom)
  if (!currentUser) return null;

  return (
    <div className="flex flex-col gap-2 w-full">
      <h2 className="font-semibold text-neutral-50 text-2xl">
        Ваш баланс
      </h2>
      <div className="flex flex-col gap-2 border border-neutral-700 p-4 w-full h-full rounded-lg">
        <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1 font-semibold text-xl">
              <Typography>
                Харизма:
              </Typography>
              <div className="flex items-center gap-1">
                <span>{0}</span>
                <img src="/images/game-content/wallets/charism.png" alt="" width={24} height={24} />
              </div>
            </div>
            <div className="flex items-center gap-2 font-semibold text-xl">
              <Typography>
                Белкоин:
              </Typography>
              <div className="flex items-center gap-1">
                <span>{0}</span>
                <img src="/images/game-content/wallets/belkoin.png" alt="" width={24} height={24} />
              </div>
            </div>
          </div>
          <Link href="/store?q=wallet" className="w-full lg:w-fit">
            <Button className="w-full bg-green-700 hover:bg-green-800">
              <Typography className="text-lg font-semibold">
                Увеличить баланс
              </Typography>
            </Button>
          </Link>
        </div>
        {/* <Typography>

        </Typography> */}
      </div>
    </div>
  )
}, "PlayerBalance")