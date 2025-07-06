import { Skeleton } from "@repo/ui/skeleton"
import { landsResource } from "../models/lands.model"
import Looking from '@repo/assets/images/looking.jpg'
import BottleEnchating from "@repo/assets/images/minecraft/bottle_enchanting.webp"
import Charism from "@repo/assets/images/minecraft/charism_wallet.png"
import SteveHead from "@repo/assets/images/minecraft/steve_head.jpg"
import { reatomComponent } from "@reatom/npm-react"
import { Link } from "@/shared/components/config/Link"
import { Button } from '@repo/ui/button'
import { currentUserAtom } from '@/shared/api/global.model'
import { tv } from 'tailwind-variants'
import { Typography } from '@repo/ui/typography'

type LandCard = {
  balance: number,
  level: number,
  members: {},
  title: string,
  ulid: string,
  name: string
}

const landCardVariants = tv({
  base: "relative bg-neutral-900 w-full border-b-2 rounded-lg p-3 sm:p-4",
  variants: {
    variant: {
      default: "border-neutral-800",
      selected: "border-green-500/40"
    }
  }
})

const LandCard = reatomComponent<LandCard>(({ ctx, balance, level, members, name, title, ulid }) => {
  const currentUser = ctx.spy(currentUserAtom)

  const isOwner = Object.keys(members)[0] === currentUser?.uuid

  return (
    <div className={landCardVariants({ variant: isOwner ? "selected" : "default" })}>
      <div className="flex items-center gap-4 overflow-hidden rounded-md">
        <img
          src={Looking}
          alt=""
          width={100}
          draggable={false}
          height={100}
          className="rounded-md select-none max-h-[86px] max-w-[86px] sm:max-h-[100px] sm:max-w-[100px]"
        />
        <div className="flex flex-col gap-1 sm:gap-2 w-full">
          <div className="flex items-center gap-2 w-full">
            <Typography className="text-xl truncate font-semibold">
              {name}
            </Typography>
            {/* {title && <ColoredText text={title} />} */}
          </div>
          <div className="flex select-none items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1">
              <img src={BottleEnchating} draggable={false} alt="lvl" width={16} height={16} />
              <Typography className="text-base">
                {level}
              </Typography>
            </div>
            <div className="flex items-center gap-1">
              <img src={Charism} draggable={false} alt="charism" width={16} height={16} />
              <Typography className="text-base">
                {balance}
              </Typography>
            </div>
            <div className="flex items-center gap-1">
              <img src={SteveHead} draggable={false} alt="members" width={16} height={16} />
              <Typography className="text-base">
                {Object.keys(members).length}
              </Typography>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/land/${ulid}`}>
              <Button className="py-1 sm:py-2 bg-neutral-50">
                <Typography color="black" className="font-semibold text-base">
                  Перейти
                </Typography>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}, "LandCard")

export const LandsList = reatomComponent(({ ctx }) => {
  const data = ctx.spy(landsResource.dataAtom)

  if (ctx.spy(landsResource.statusesAtom).isPending) return (
    <>
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </>
  )

  if (!data) return null;

  return data.data.map((land) => <LandCard key={land.ulid} {...land} />)
}, "LandsList")