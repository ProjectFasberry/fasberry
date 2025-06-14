import { Button } from "@repo/ui/src/components/button"
import { Typography } from "@repo/ui/src/components/typography"
import Looking from '@repo/assets/images/looking.jpg'
import BottleEnchating from "@repo/assets/images/minecraft/bottle_enchanting.webp"
import Charism from "@repo/assets/images/minecraft/charism_wallet.png"
import SteveHead from "@repo/assets/images/minecraft/steve_head.jpg"
import { reatomComponent } from "@reatom/npm-react"
import { Link } from "@/shared/components/Link"

type LandCard = {
  balance: number,
  level: number,
  members: {},
  title: string,
  ulid: string,
  name: string
}

export const LandCard = reatomComponent<LandCard>(({ ctx, balance, level, members, name, title, ulid }) => {
  // const currentUserUUID = getUser(ctx).uuid

  // const isOwner = Object.keys(members)[0] === currentUserUUID

  return (
    <div
      className={`relative ${false && "outline-1 outline-green-500"} 
      bg-shark-950 w-full border-b border-shark-800 rounded-lg p-4`}
    >
      <div className="flex items-center gap-4 overflow-hidden rounded-md">
        <img
          src={Looking}
          alt=""
          width={100}
          draggable={false}
          height={100}
          className="rounded-md"
        />
        <div className="flex flex-col gap-y-2">
          <div className="flex items-center gap-2">
            <Typography className="text-[20px] font-[Minecraft]">
              {name}
            </Typography>
            {/* {title && <ColoredText className="font-[Minecraft]" text={title} />} */}
          </div>
          <div className="flex select-none items-center gap-4">
            <div className="flex items-center gap-1">
              <img src={BottleEnchating} draggable={false} alt="lvl" width={16} height={16} />
              <Typography className="text-[16px] font-[Minecraft]">
                {level}
              </Typography>
            </div>
            <div className="flex items-center gap-1">
              <img src={Charism} draggable={false} alt="charism" width={16} height={16} />
              <Typography className="text-[16px] font-[Minecraft]">
                {balance}
              </Typography>
            </div>
            <div className="flex items-center gap-1">
              <img src={SteveHead} draggable={false} alt="members" width={16} height={16} />
              <Typography className="text-[16px] font-[Minecraft]">
                {Object.keys(members).length}
              </Typography>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/land/${ulid}`}>
              <Button state="default">
                <Typography className="text-[16px] font-[Minecraft]">
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