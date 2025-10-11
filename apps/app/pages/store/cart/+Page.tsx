import { MainWrapperPage } from "@/shared/components/config/wrapper";
import { reatomComponent } from "@reatom/npm-react";
import { Button } from "@repo/ui/button";
import { Typography } from "@repo/ui/typography";
import { IconArrowLeft } from "@tabler/icons-react";
import { atom, CtxSpy, onDisconnect, withReset } from "@reatom/framework";
import { createOrderAction } from "@/shared/components/app/shop/models/store.model";
import { ReactNode } from "react";
import { CartOrders } from "@/shared/components/app/shop/components/cart/cart-orders";
import { CartContent } from "@/shared/components/app/shop/components/cart/cart-content";

const StoreLoader = reatomComponent(({ ctx }) => {
  const isLoading = ctx.spy(createOrderAction.statusesAtom).isPending;

  ctx.schedule(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    }
  });

  if (!isLoading) return null;

  return (
    <div className="flex z-[1000] items-center flex-col gap-4 fixed bg-black/60 justify-center h-full w-full">
      <div className="ui-loader loader-blk">
        <svg viewBox="22 22 44 44" className="multiColor-loader">
          <circle cx="44" cy="44" r="20.2" fill="none" strokeWidth="3.6" className="loader-circle loader-circle-animation">
          </circle>
        </svg>
      </div>
      <Typography className="font-semibold text-xl">
        Готовим заказ
      </Typography>
    </div>
  )
}, "StoreLoader")

type StoreCartType = typeof STORE_BADGES[number]["value"]

const storeCartTypeAtom = atom<StoreCartType>("basket", "storeCartType").pipe(withReset())
const storeCartTypeIsActive = (ctx: CtxSpy, target: StoreCartType) => ctx.spy(storeCartTypeAtom) === target

onDisconnect(storeCartTypeAtom, (ctx) => storeCartTypeAtom.reset(ctx))

const STORE_BADGES = [
  {
    title: "Корзина",
    value: "basket",
    condition: function (ctx: CtxSpy) { return storeCartTypeIsActive(ctx, this.value) }
  },
  {
    title: "Заказы",
    value: "orders",
    condition: function (ctx: CtxSpy) { return storeCartTypeIsActive(ctx, this.value) }
  }
] as const;

const STORE_COMPONENTS: Record<StoreCartType, ReactNode> = {
  "basket": <CartContent />,
  "orders": <CartOrders />
}

const StoreNavigation = reatomComponent(({ ctx }) => {
  return (
    <div className="flex items-center gap-2 w-full">
      <Button onClick={() => window.history.back()} className="h-10 p-0 aspect-square rounded-full bg-neutral-800">
        <IconArrowLeft size={22} className='text-neutral-400' />
      </Button>
      {STORE_BADGES.map((badge) => (
        <Button
          key={badge.value}
          data-state={badge.condition(ctx) ? "active" : "inactive"}
          className="group h-10 border-2 data-[state=active]:bg-neutral-800 border-neutral-800 rounded-full px-4 py-1"
          onClick={() => storeCartTypeAtom(ctx, badge.value)}
        >
          <Typography className="font-semibold text-neutral-200">
            {badge.title}
          </Typography>
        </Button>
      ))}
    </div>
  )
}, "StoreNavigation")

const StoreContent = reatomComponent(({ ctx }) => STORE_COMPONENTS[ctx.spy(storeCartTypeAtom)])

export default function StoreCart() {
  return (
    <>
      <StoreLoader />
      <MainWrapperPage>
        <div className="flex flex-col gap-4 w-full h-full">
          <div className="flex items-center gap-2">
            <Typography className="text-3xl font-semibold">
              Хранилище
            </Typography>
          </div>
          <StoreNavigation />
          <StoreContent />
        </div>
      </MainWrapperPage>
    </>
  )
}