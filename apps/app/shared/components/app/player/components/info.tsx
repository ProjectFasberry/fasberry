import { reatomComponent } from "@reatom/npm-react";
import { Rate } from "./rate";
import { targetUserAtom } from "../models/player.model";
import dayjs from "@/shared/lib/create-dayjs"
import { DONATE_COLORS, DONATE_TITLE } from "@repo/shared/constants/donate-aliases";

export const PlayerInfo = reatomComponent(({ ctx }) => {
  const user = ctx.spy(targetUserAtom)
  if (!user) return null;

  const { nickname, group } = user;

  const loginAt = (user.details.login_date as string).includes("1970")
    ? "был на сервере давно"
    : dayjs(user.details.login_date).format("был на сервере D MMM YYYY")

  return (
    <div className="flex justify-between h-full items-center w-full">
      <div className='flex flex-col gap-2'>
        <h1 className="text-4xl font-bold">{nickname}</h1>
        <span>
          {loginAt}
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <div style={{ borderColor: DONATE_COLORS[group] }} className="flex px-3 items-center justify-center gap-2 py-1 rounded-full border ">
            <span style={{ backgroundColor: DONATE_COLORS[group] }} className="h-[12px] w-[12px] rounded-full" />
            <span>
              {DONATE_TITLE[group]}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center w-min">
        <Rate isRated={user.details.rate.isRated} nickname={nickname} count={user.details.rate.count} />
      </div>
    </div>
  )
}, "PlayerInfo")