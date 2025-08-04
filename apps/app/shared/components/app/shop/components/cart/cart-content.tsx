import { atom } from "@reatom/core";
import { reatomComponent } from "@reatom/npm-react";
import { Typography } from "@repo/ui/typography";
import { cartDataSelectedAtom, cartDataAtom, cartIsValidAtom } from "../../models/store-cart.model";
import { StorePrice } from "./store-price";
import { Link } from "@/shared/components/config/link";
import { Button } from "@repo/ui/button";
import { StoreSelectCurrency } from "./store-currency";
import { spawn } from "@reatom/framework";
import { createPaymentAction } from "../../models/store.model";
import { CartItem } from "./cart-item";
import { tv } from "tailwind-variants";
import { getStaticImage } from "@/shared/lib/volume-helpers";

const sectionVariant = tv({
  base: `bg-neutral-900 gap-4 p-2 sm:p-3 lg:p-4 rounded-lg w-full`
})

const CartContentData = reatomComponent(({ ctx }) => {
  const data = ctx.spy(cartDataAtom);

  return (
    <div className="flex flex-col gap-4 w-full">
      {data.map(item => <CartItem key={item.id} {...item} />)}
    </div>
  )
}, "CartContentData")

const CartSummerySelected = reatomComponent(({ ctx }) => ctx.spy(cartDataSelectedAtom).length, "CartSummerySelected")
const CartSummeryTotal = reatomComponent(({ ctx }) => ctx.spy(cartDataAtom).length, "CartSummery")

const CartActionsSubmit = reatomComponent(({ ctx }) => {
  const isValid = ctx.spy(cartIsValidAtom);

  const handle = () => {
    void spawn(ctx, async (spawnCtx) => createPaymentAction(spawnCtx))
  }

  return (
    <Button
      disabled={!isValid}
      onClick={handle}
      className="bg-green-700 hover:bg-green-800 rounded-xl"
    >
      <Typography color="white" className="text-lg font-semibold">
        Перейти к оформлению
      </Typography>
    </Button>
  )
}, "CartActionsSubmit")

const CartContentEmpty = () => {
  return (
    <div className={sectionVariant({ className: "flex gap-2 *:w-fit flex-col w-full" })}>
      <Typography className='text-2xl font-semibold'>
        Пусто
      </Typography>
      <Typography color="gray">
        Перейдите в магазин, чтобы найти всё, что нужно.
      </Typography>
      <Link href="/store">
        <Button className="bg-neutral-800 font-semibold">
          В магазин
        </Button>
      </Link>
    </div>
  )
}

const cartDataIsEmptyAtom = atom((ctx) => ctx.spy(cartDataAtom).length === 0)

export const CartContent = reatomComponent(({ ctx }) => {
  const isEmpty = ctx.spy(cartDataIsEmptyAtom);

  if (isEmpty) return <CartContentEmpty />;

  return (
    <div className="flex flex-col lg:flex-row items-start w-full gap-6 h-fit">
      <div className={sectionVariant({ className: "flex flex-col lg:w-2/3" })}>
        <Typography className="text-2xl font-semibold">
          Содержимое
        </Typography>
        <CartContentData />
        <div className="flex items-center justify-between w-full gap-2">
          <Typography className="font-semibold">
            Товаров: <CartSummeryTotal />
          </Typography>
          <Typography className="font-semibold">
            Выбрано: <CartSummerySelected />
          </Typography>
        </div>
      </div>
      <div className={sectionVariant({ className: "flex flex-col lg:w-1/3" })}>
        <div className="flex flex-col gap-4">
          <CartActionsSubmit />
          <div className="flex flex-col gap-4 w-full h-full">
            <div className="flex justify-between w-full items-center gap-2">
              <div className="flex flex-col">
                <Typography color="white" className="text-lg font-semibold">
                  Способ оплаты
                </Typography>
                <Typography color="gray" className="leading-4 w-full text-wrap truncate">
                  Можно выбрать иной способ оплаты
                </Typography>
              </div>
              <div className="flex items-center gap-2">
                <StoreSelectCurrency />
              </div>
            </div>
          </div>
          <div
            className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full h-full"
          >
            <div className="flex items-start gap-2 justify-center w-fit rounded-lg">
              <div className="flex items-center justify-center bg-neutral-600/40 p-2 rounded-lg">
                <img src={getStaticImage("icons/exp-active.webp")} loading="lazy" width={32} height={32} alt="" />
              </div>
              <div className="flex flex-col justify-center">
                <Typography color="gray" className="text-lg leading-6">
                  Стоимость
                </Typography>
                <StorePrice />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}, "CartContent")