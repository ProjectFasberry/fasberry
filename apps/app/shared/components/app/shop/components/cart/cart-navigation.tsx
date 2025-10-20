import { atom, CtxSpy, onDisconnect, withReset } from "@reatom/framework"
import { reatomComponent } from "@reatom/npm-react"
import { Button } from "@repo/ui/button"
import { Typography } from "@repo/ui/typography"
import { IconArrowLeft } from "@tabler/icons-react"

export type StoreCartType = typeof STORE_BADGES[number]["value"]

export const storeCartTypeAtom = atom<StoreCartType>("content", "storeCartType").pipe(withReset())
const storeCartTypeIsActive = (ctx: CtxSpy, target: StoreCartType) => ctx.spy(storeCartTypeAtom) === target

onDisconnect(storeCartTypeAtom, (ctx) => storeCartTypeAtom.reset(ctx))

const makeBadge = (title: string, value: string) => ({
  title, value, cd: (ctx: CtxSpy) => storeCartTypeIsActive(ctx, value),
});

const STORE_BADGES = [
  makeBadge("Корзина", "content"),
  makeBadge("Заказы", "orders"),
  makeBadge("Настройки", "prefs"),
] as const;

export const CartNavigation = reatomComponent(({ ctx }) => {
  return (
    <div className="flex items-center gap-2 w-full">
      <Button onClick={() => window.history.back()} className="h-10 p-0 aspect-square rounded-xl bg-neutral-800">
        <IconArrowLeft size={22} className='text-neutral-400' />
      </Button>
      {STORE_BADGES.map((badge) => (
        <Button
          key={badge.value}
          data-state={badge.cd(ctx) ? "active" : "inactive"}
          className="group h-10 border-2 data-[state=active]:bg-neutral-800 border-neutral-800 rounded-xl px-4 py-1"
          onClick={() => storeCartTypeAtom(ctx, badge.value)}
        >
          <Typography className="font-semibold text-neutral-200">
            {badge.title}
          </Typography>
        </Button>
      ))}
    </div>
  )
}, "CartNavigation")
