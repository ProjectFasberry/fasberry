import { reatomComponent, useUpdate } from "@reatom/npm-react";
import { Typography } from "@repo/ui/typography";
import { Button } from "@repo/ui/button";
import { getStaticImage } from "@/shared/lib/volume-helpers";
import { IconPencil, IconPlus, IconSettings } from "@tabler/icons-react";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/popover";
import { Switch } from "@repo/ui/switch";
import { belkoinBalanceAtom, charismBalanceAtom, balanceAction, animateBalanceAtom } from "../models/balance.model";
import { AnimatedNumber } from "@repo/ui/animated-number"
import { navigate } from "vike/client/router";
import { appDictionariesAtom } from "@/shared/models/app.model";
import { belkoinImage, charismImage } from "@/shared/consts/images";

const cardImage = getStaticImage("arts/steve_night.jpg")

const animateOptions = {
  bounce: 0,
  duration: 2000,
}

type BalanceCardProps = {
  balance: number,
  value: string,
  image: string
}

const BalanceCard = reatomComponent<BalanceCardProps>(({ ctx, balance, value, image }) => {
  const title = appDictionariesAtom.get(ctx, value)
  const animate = ctx.spy(animateBalanceAtom);

  return (
    <div className="relative rounded-2xl min-w-80 overflow-hidden w-full h-56">
      <img
        src={cardImage}
        className="object-bottom object-cover select-none w-full h-full"
        alt=""
        draggable={false}
      />
      <div className="absolute inset-0 select-none">
        <div className="absolute inset-0 backdrop-blur-[4px] bg-black/10"></div>
        <div className="absolute inset-y-1/2 bottom-0 backdrop-blur-sm bg-black/20"></div>
        <div className="absolute inset-y-1/3 bottom-0 backdrop-blur-[10px] bg-black/40"></div>
      </div>
      <div className="absolute inset-0 flex flex-col justify-between p-6 z-[5]">
        <Typography className="select-none font-semibold text-neutral-50 text-2xl">
          {title}
        </Typography>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <img
              src={image}
              width={28}
              height={28}
              alt=""
              draggable={false}
              className='select-none'
            />
            <div className="inline-flex items-center text-neutral-50 text-2xl font-light">
              {animate ? (
                <AnimatedNumber springOptions={animateOptions} value={balance} />
              ) : (
                <span>{balance}</span>
              )}
            </div>
          </div>
          <Button
            className="cursor-pointer bg-neutral-50/80 rounded-lg p-1"
            onClick={() => navigate(`/store/topup?target=${value}`)}
          >
            <IconPlus size={24} className="text-neutral-950" />
          </Button>
        </div>
      </div>
    </div>
  )
}, "BalanceCard")

const BelkoinCard = reatomComponent(({ ctx }) => {
  const data = ctx.spy(belkoinBalanceAtom);
  return <BalanceCard balance={data} value="BELKOIN" image={belkoinImage} />
}, "BelkoinCard")

const CharismCard = reatomComponent(({ ctx }) => {
  const data = ctx.spy(charismBalanceAtom);
  return <BalanceCard balance={data} value="CHARISM" image={charismImage} />
}, "CharismCard")

const BalanceSettingsDesign = reatomComponent(({ ctx }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="cursor-pointer bg-neutral-900 rounded-lg p-1">
          <IconPencil size={18} className="text-neutral-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" side="bottom">
        <div className="flex flex-col gap-2 w-full h-full">
          <Typography className="text-neutral-400 text-md">
            Дизайн
          </Typography>
          <Typography>недоступно</Typography>
        </div>
      </PopoverContent>
    </Popover>
  )
})

const BalanceSettingsOptions = reatomComponent(({ ctx }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="cursor-pointer bg-neutral-900 rounded-lg p-1">
          <IconSettings size={18} className="text-neutral-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" side="bottom">
        <div className="flex flex-col gap-2 w-full h-full">
          <Typography className="text-neutral-400 text-md">
            Особенности
          </Typography>
          <div className="flex flex-col w-full h-full">
            <div className="flex items-center justify-between gap-1 w-full">
              <Typography className="cursor-pointer text-neutral-100">
                Показывать анимацию
              </Typography>
              <Switch
                checked={ctx.spy(animateBalanceAtom)}
                onCheckedChange={v => animateBalanceAtom(ctx, v)}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
})

const BalanceSettings = () => {
  return (
    <div className="flex items-center gap-2 bg-neutral-50/80 rounded-xl px-4 py-1">
      <BalanceSettingsOptions />
      <BalanceSettingsDesign />
    </div>
  )
}

export const Balance = () => {
  useUpdate(balanceAction, [])

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between w-full">
        <Typography className="text-2xl font-semibold">
          Баланс:
        </Typography>
        <BalanceSettings />
      </div>
      <div
        className="flex items-center h-full scrollbar scrollbar-thumb-neutral-300 scrollbar-track-background-dark 
          justify-start overflow-x-auto w-full gap-2"
      >
        <CharismCard />
        <BelkoinCard />
      </div>
    </div>
  )
}