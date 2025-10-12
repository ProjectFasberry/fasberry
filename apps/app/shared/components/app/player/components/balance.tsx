import { reatomComponent, useUpdate } from "@reatom/npm-react";
import { Typography } from "@repo/ui/typography";
import { Button } from "@repo/ui/button";
import { getStaticImage } from "@/shared/lib/volume-helpers";
import { IconPencil, IconPlus, IconSettings } from "@tabler/icons-react";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/popover";
import { Switch } from "@repo/ui/switch";
import { belkoinBalanceAtom, charismBalanceAtom, financeAction } from "../models/finance.model";
import { AnimatedNumber } from "@repo/ui/animated-number"
import { atom } from "@reatom/core";
import { withLocalStorage } from "@reatom/persist-web-storage";
import { navigate } from "vike/client/router";

const cardImage = getStaticImage("arts/steve_night.jpg")
const belkoinImage = getStaticImage("items/belkoin_wallet.png")
const charismImage = getStaticImage("items/charism_wallet.png")

const animateBalanceAtom = atom(true, "animateBalance").pipe(withLocalStorage({ key: "animate-balance" }))

const animateOptions = {
  bounce: 0,
  duration: 2000,
}

const D = {
  "Харизма": "CHARISM",
  "Белкоин": "BELKOIN"
}

const BalanceCard = reatomComponent<{ title: string, value: number, image: string }>(({ ctx, title, value, image }) => {
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
      <div className="absolute inset-0 flex flex-col justify-between p-6 z-20">
        <Typography className="select-none font-mono font-semibold text-neutral-50 text-2xl">
          {title}
        </Typography>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <img src={image} width={28} height={28} alt="" draggable={false} className='select-none' />
            {ctx.spy(animateBalanceAtom) ? (
              <AnimatedNumber
                className='inline-flex items-center font-mono text-neutral-50 text-2xl font-light'
                springOptions={animateOptions}
                value={value}
              />
            ) : (
              <span className="inline-flex items-center font-mono text-neutral-50 text-2xl font-light">{value}</span>
            )}
          </div>
          <Button
            className="cursor-pointer bg-neutral-50/80 rounded-lg p-1"
            // @ts-expect-error
            onClick={() => navigate(`/store/topup?target=${D[title]}`)}
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
  return <BalanceCard value={data} title="Белкоин" image={belkoinImage} />
}, "BelkoinCard")

const CharismCard = reatomComponent(({ ctx }) => {
  const data = ctx.spy(charismBalanceAtom);
  return <BalanceCard value={data} title="Харизма" image={charismImage} />
}, "CharismCard")

const FinanceSettingsDesign = reatomComponent(({ ctx }) => {
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

const FinanceSettingsOptions = reatomComponent(({ ctx }) => {
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
              <Switch checked={ctx.spy(animateBalanceAtom)} onCheckedChange={v => animateBalanceAtom(ctx, v)} />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
})

const FinanceSettings = () => {
  return (
    <div className="flex items-center gap-2 bg-neutral-50/80 rounded-xl px-4 py-1">
      <FinanceSettingsOptions />
      <FinanceSettingsDesign />
    </div>
  )
}

export const Finance = () => {
  useUpdate(financeAction, [])

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between w-full">
        <Typography className="text-2xl font-semibold">
          Баланс:
        </Typography>
        <FinanceSettings />
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