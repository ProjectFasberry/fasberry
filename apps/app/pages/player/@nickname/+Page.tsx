import { headAction, skinAction } from "@/shared/components/app/skin/models/skin.model"
import { reatomComponent } from "@reatom/npm-react"
import { ProfileSkinControls } from "@/shared/components/app/skin/components/profile-skin-controls"
import { clientOnly } from "vike-react/clientOnly"
import { Suspense } from "react"
import { Skeleton } from "@repo/ui/skeleton"
import { MainWrapperPage } from "@repo/ui/main-wrapper"
import { spawn } from "@reatom/framework"
import { currentUserAtom, isSsrAtom, pageContextAtom, userParam } from "@/shared/api/global.model"
import { Button } from "@repo/ui/button"
import { Typography } from "@repo/ui/typography"
import { logout } from "@/shared/components/app/auth/models/auth.model"
import { IconHeart } from "@tabler/icons-react"

// const Stats = clientOnly(() => import("@/shared/components/app/player/heatmap").then(m => m.Stats))
const ProfileSkinRender = clientOnly(() => import("@/shared/components/app/skin/components/profile-skin-render").then(m => m.ProfileSkinRender))

pageContextAtom.onChange((ctx, target) => {
  if (!target) return;

  userParam(ctx, target.routeParams.nickname)
  skinAction(ctx)
})

const Skin = reatomComponent(({ ctx }) => {
  const head = ctx.spy(headAction.dataAtom)

  if (ctx.spy(isSsrAtom) || ctx.spy(headAction.statusesAtom).isPending) {
    return <Skeleton className="w-1/3 border h-[520px]" />
  }

  if (!head) return;

  return (
    <div className="flex flex-col h-full gap-2 w-full lg:w-1/3">
      <div className="flex flex-col gap-2 justify-between w-full lg:min-h-[520px] lg:border lg:border-neutral-700 rounded-lg">
        <div className="hidden lg:flex flex-col items-center gap-2 w-full text-neutral-400">
          <ProfileSkinRender fallback={<Skeleton className="w-full h-[450px]" />} />
          <img
            src={head}
            width={48}
            height={48}
            className="cursor-pointer rounded-lg p-0.5 border-2 border-green-600"
          />
        </div>
        <div className="flex lg:hidden flex-col justify-center items-center gap-2 p-6 w-full text-neutral-400">
          <img
            src={head}
            width={48}
            height={48}
            className="w-[128px] h-[128px] cursor-pointer rounded-lg p-0.5 border-2 border-green-600"
          />
        </div>
      </div>
      <ProfileSkinControls />
    </div>
  )
})

const PlayerInfo = reatomComponent(({ ctx }) => {
  const nickname = ctx.spy(userParam)

  return (
    <div className="flex justify-between h-full items-center w-full">
      <div className='flex flex-col gap-2'>
        <h1 className="text-4xl font-bold">{nickname}</h1>
        <span>был на сервере год назад</span>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex px-3 items-center justify-center gap-2 py-1 rounded-full border border-neutral-700">
            <span className="h-[12px] bg-neutral-600 w-[12px] rounded-full" />
            <span>Игрок</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center w-min">
        <Button className="flex border-2 border-neutral-700 rounded-full items-center gap-2">
          <IconHeart size={20} className="text-neutral-400" />
          <span className="text-lg">0</span>
        </Button>
      </div>
    </div>
  )
}, "PlayerInfo")

const PlayerAttributes = reatomComponent(({ ctx }) => {
  const nickname = ctx.spy(userParam)

  return (
    <>
      <div className="flex flex-col gap-2 w-full">
        <h3 className="font-semibold text-neutral-50 text-2xl">Привилегия</h3>
        <Typography color="gray" className="text-lg">
          нет
        </Typography>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <h3 className="font-semibold text-2xl">Территории</h3>
        <Typography color="gray" className="text-lg">
          нет
        </Typography>
      </div>
    </>
  )
}, "PlayerAttributes")

const Logout = reatomComponent(({ ctx }) => {
  const currentUser = ctx.spy(currentUserAtom)

  if (!currentUser) return null;

  const user = ctx.spy(userParam)

  if (user !== currentUser.nickname) return null;

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
})

export default function PlayerPage() {
  return (
    <MainWrapperPage>
      <div className="flex flex-col lg:flex-row w-full h-full items-start gap-8">
        <Skin />
        <div className="flex flex-col w-full py-4 gap-12 lg:w-2/3 h-full">
          <PlayerInfo />
          {/* <Stats fallback={<Skeleton className="h-[200px] w-full" />} /> */}
          <PlayerAttributes />
          <Logout />
        </div>
      </div >
    </MainWrapperPage>
  )
}