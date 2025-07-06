import { skinAction } from "@/shared/components/app/skin/models/skin.model"
import { reatomComponent } from "@reatom/npm-react"
import { ProfileSkinControls } from "@/shared/components/app/skin/components/profile-skin-controls"
import { clientOnly } from "vike-react/clientOnly"
import { Skeleton } from "@repo/ui/skeleton"
import { MainWrapperPage } from "@/shared/components/config/wrapper";
import { atom, reatomAsync, spawn, withDataAtom, withStatusesAtom } from "@reatom/framework"
import { currentUserAtom, isSsrAtom, pageContextAtom, userParam } from "@/shared/api/global.model"
import { Button } from "@repo/ui/button"
import { Typography } from "@repo/ui/typography"
import { logout } from "@/shared/components/app/auth/models/auth.model"
import { IconHeart } from "@tabler/icons-react"
import { PageContext } from "vike/types"
import { Data } from "./+data"
import { DONATE_TITLE } from "@repo/shared/constants/donate-aliases"
import type { User } from "@repo/shared/types/entities/user"
import dayjs from "dayjs"
import { BASE } from "@/shared/api/client"
import { Land } from "@/shared/components/app/land/models/land.model"
import { isChanged } from "@/shared/lib/reatom-helpers"
import { navigate } from "vike/client/router"
import { toast } from "sonner"
import { tv } from "tailwind-variants"

// const Stats = clientOnly(() => import("@/shared/components/app/player/heatmap").then(m => m.Stats))
const ProfileSkinRender = clientOnly(() => import("@/shared/components/app/skin/components/profile-skin-render").then(m => m.ProfileSkinRender))

const userAtom = atom<User | null>(null, "user")

const getUserUrl = (id: string) => `/player/${id}`

pageContextAtom.onChange((ctx, state) => {
  if (!state) return;

  const target = state as PageContext<Data>
  const user = target.data?.user ?? null

  if (target.urlPathname === getUserUrl(target.routeParams.nickname)) {
    userAtom(ctx, user)
    userLands(ctx, user.nickname)
    userParam(ctx, target.routeParams.nickname)
    skinAction(ctx)
  }
})

const Skin = reatomComponent(({ ctx }) => {
  const user = ctx.spy(userAtom)

  if (ctx.spy(isSsrAtom)) {
    return <Skeleton className="w-full lg:w-1/3 lg:border lg:h-[520px]" />
  }

  if (!user) return;

  return (
    <div className="flex flex-col h-full gap-2 w-full lg:w-1/3">
      <div className="flex flex-col gap-2 justify-between w-full lg:min-h-[520px] lg:border lg:border-neutral-700 rounded-lg">
        <div className="hidden lg:flex flex-col items-center gap-2 w-full text-neutral-400">
          <ProfileSkinRender fallback={<Skeleton className="w-full h-[450px]" />} />
          <img
            src={user.avatar}
            width={48}
            alt={user.nickname}
            fetchPriority="high"
            loading="eager"
            height={48}
            className="cursor-pointer rounded-lg p-0.5 border-2 border-green-600"
          />
        </div>
        <div className="flex lg:hidden flex-col justify-center items-center gap-2 p-6 w-full text-neutral-400">
          <img
            src={user.avatar}
            width={128}
            height={128}
            fetchPriority="high"
            loading="eager"
            alt={user.nickname}
            className="w-[128px] h-[128px] cursor-pointer rounded-lg p-0.5 border-2 border-green-600"
          />
        </div>
      </div>
      <ProfileSkinControls />
    </div>
  )
}, "Skin")

const rateUser = reatomAsync(async (ctx, target: string) => {
  if (ctx.get(isIdentityAtom)) {
    return;
  }

  return await ctx.schedule(async () => {
    const res = await BASE.post(`rate/${target}`, { throwHttpErrors: false, signal: ctx.controller.signal })
    const data = await res.json<WrappedResponse<"rated" | "unrated">>()

    if ("error" in data) {
      return null;
    }

    return data.data
  })
}, {
  name: "rateUser",
  onFulfill: (ctx, res) => {
    if (!res) return null;

    userAtom(ctx, (state) => {
      if (!state) return null;

      const updated = {
        rate: {
          count: res === 'rated' ? state?.details.rate.count + 1 : state?.details.rate.count - 1,
          isRated: res === 'rated'
        }
      }

      return {
        ...state, details: { ...state?.details, ...updated }
      }
    })
  },
  onReject: (ctx, e) => {
    if (e instanceof Error) {
      toast.error(e.message)
    }
  }
}).pipe(withStatusesAtom())

const isIdentityAtom = atom((ctx) => {
  const currentUser = ctx.spy(currentUserAtom)
  const targetUser = ctx.spy(userAtom)

  return targetUser?.nickname === currentUser?.nickname;
}, "isIdentity")

const likeButtonVariants = tv({
  base: `flex border-2 group rounded-full duration-150 *:duration-150 items-center gap-2`,
  variants: {
    variant: {
      inactive: "border-neutral-700",
      active: "border-red-600/90 bg-red-500/70 backdrop-blur-md"
    }
  },
  defaultVariants: {
    variant: "inactive"
  }
})

const PlayerInfo = reatomComponent(({ ctx }) => {
  const user = ctx.spy(userAtom)
  if (!user) return null;

  const { nickname, group } = user;

  const loginAt = dayjs(user.details.login_date).format("был на сервере D MMM YYYY")

  return (
    <div className="flex justify-between h-full items-center w-full">
      <div className='flex flex-col gap-2'>
        <h1 className="text-4xl font-bold">{nickname}</h1>
        <span>
          {loginAt}
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex px-3 items-center justify-center gap-2 py-1 rounded-full border border-neutral-700">
            <span className="h-[12px] bg-neutral-600 w-[12px] rounded-full" />
            <span>
              {DONATE_TITLE[group]}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center w-min">
        <Button
          data-state={user.details.rate.isRated ? "rated" : "unrated"}
          disabled={ctx.spy(rateUser.statusesAtom).isPending}
          onClick={() => rateUser(ctx, user.nickname)}
          className={likeButtonVariants({ variant: user.details.rate.isRated ? "active" : "inactive" })}
        >
          <IconHeart
            size={20}
            className="group-data-[state=rated]:text-neutral-50 group-data-[state=rated]:fill-neutral-50"
          />
          <span className="text-lg group-data-[state=rated]:text-neutral-50">{user.details.rate.count}</span>
        </Button>
      </div>
    </div>
  )
}, "PlayerInfo")

type UserLands = {
  data: Land[],
  meta: {
    count: number
  }
}

const userLands = reatomAsync(async (ctx, nickname: string) => {
  return await ctx.schedule(async () => {
    const res = await BASE(`server/lands/${nickname}`, { signal: ctx.controller.signal })
    const data = await res.json<WrappedResponse<UserLands>>()

    if ("error" in data) return null;

    return data.data
  })
}).pipe(withDataAtom(), withStatusesAtom())

userParam.onChange((ctx, state) => {
  isChanged(ctx, userParam, state, () => {
    userLands.dataAtom.reset(ctx)
  })
})

const PlayerLands = reatomComponent(({ ctx }) => {
  const lands = ctx.spy(userLands.dataAtom)

  if (ctx.spy(userLands.statusesAtom).isPending) {
    return <Skeleton className="h-24 w-full" />
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-2">
        <h3 className="text-white font-semibold text-2xl">Территории</h3>
        <div className="w-8 flex items-center justify-center bg-neutral-800 h-8 rounded-full p-0.5">
          <span className="font-semibold text-lg">{lands?.meta?.count ?? 0}</span>
        </div>
      </div>
      {lands && lands.data ? (
        lands.data.map(land => (
          <div
            key={land.ulid}
            onClick={() => navigate(`/land/${land.ulid}`)}
            className="flex p-2 lg:p-4 border hover:bg-neutral-800 duration-150 ease-in-out border-neutral-800 cursor-pointer rounded-md"
          >
            <div className="flex flex-col w-full lg:w-3/4">
              <Typography className="text-lg font-semibold">
                {land.name}
              </Typography>
              {land.title && (
                <Typography color="gray" className="text-base">
                  {land.title}
                </Typography>
              )}
              <div className="flex flex-col gap-1">
                <span className="text-base">{land.members.length} {land.members.length >= 1 ? "участника" : "участник"}</span>
                <span className="text-base">{land.chunks_amount} чанков</span>
              </div>
            </div>
            <div className="hidden lg:flex flex-col w-1/4">

            </div>
          </div>
        ))
      ) : (
        <Typography color="gray" className="text-lg">
          нет
        </Typography>
      )}
    </div>
  )
}, "PlayerLands")

const PlayerAttributes = reatomComponent(({ ctx }) => {
  const user = ctx.spy(userAtom)
  if (!user) return null;

  return (
    <>
      <div className="flex flex-col gap-2 w-full">
        <h2 className="font-semibold text-neutral-50 text-2xl">Привилегия</h2>
        <Typography color="gray" className="text-lg">
          {user.group === 'default' ? "нет" : "да"}
        </Typography>
      </div>
    </>
  )
}, "PlayerAttributes")

const Logout = reatomComponent(({ ctx }) => {
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

export default function PlayerPage() {
  return (
    <MainWrapperPage>
      <div className="flex flex-col lg:flex-row w-full h-full items-start gap-8">
        <Skin />
        <div className="flex flex-col w-full py-4 gap-12 lg:w-2/3 h-full">
          <PlayerInfo />
          {/* <Stats fallback={<Skeleton className="h-[200px] w-full" />} /> */}
          <PlayerAttributes />
          <PlayerLands />
          <Logout />
        </div>
      </div >
    </MainWrapperPage>
  )
}