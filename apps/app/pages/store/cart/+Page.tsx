import { StorePrice } from "@/shared/components/app/shop/components/cart/store-price";
import { MainWrapperPage } from "@/shared/components/config/wrapper";
import { reatomComponent } from "@reatom/npm-react";
import { Button } from "@repo/ui/button";
import { Typography } from "@repo/ui/typography";
import { IconArrowLeft } from "@tabler/icons-react";
import ExpActive from "@repo/assets/images/minecraft/exp-active.webp"
import { cardDataSelectedAtom, cartDataAtom, cartIsValidAtom } from "@/shared/components/app/shop/models/store-cart.model";
import { Link } from "@/shared/components/config/link";
import { tv } from "tailwind-variants";
import { CartItem } from "@/shared/components/app/shop/components/cart/basket-item";
import { StoreSelectCurrency } from "@/shared/components/app/shop/components/cart/store-currency";

const sectionVariant = tv({
  base: `bg-neutral-900 gap-4 p-2 sm:p-3 lg:p-4 rounded-lg w-full`
})

const CartContentData = reatomComponent(({ ctx }) => {
  const data = ctx.spy(cartDataAtom);

  return (
    <>
      <Typography className="text-2xl font-semibold">
        Содержимое
      </Typography>
      <div className="flex flex-col gap-4 w-full">
        {data.map((item, idx) => (
          <CartItem key={idx} {...item} />
        ))}
      </div>
    </>
  )
}, "CartContentData")

const CartSummery = reatomComponent(({ ctx }) => {
  const all = ctx.spy(cartDataAtom).length;
  const selected = ctx.spy(cardDataSelectedAtom).length

  return (
    <div className="flex items-center justify-between w-full gap-2">
      <Typography className="font-semibold">
        Товаров: {all}
      </Typography>
      <Typography className="font-semibold">
        Выбрано: {selected}
      </Typography>
    </div>
  )
}, "CartSummery")

const CartActions = reatomComponent(({ ctx }) => {
  const isDisabled = !ctx.spy(cartIsValidAtom);

  return (
    <div className="flex flex-col gap-4">
      <Button
        disabled={isDisabled}
        className="bg-green-700 hover:bg-green-800 rounded-xl"
      >
        <Typography color="white" className="text-lg font-semibold">
          Перейти к оформлению
        </Typography>
      </Button>
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
        <div className="flex items-center gap-2 justify-center w-fit rounded-lg">
          <div className="flex items-center justify-center bg-neutral-600/40 p-2 rounded-lg">
            <img src={ExpActive} loading="lazy" width={32} height={32} alt="" />
          </div>
          <div className="flex flex-col justify-center">
            <Typography color="gray" className="text-lg leading-6">Стоимость</Typography>
            <StorePrice />
          </div>
        </div>
      </div>
    </div>
  )
}, "CartActions")

const CartContent = reatomComponent(({ ctx }) => {
  const data = ctx.spy(cartDataAtom);

  if (!data.length) {
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

  return (
    <div className="flex flex-col lg:flex-row items-start w-full gap-6 h-fit">
      <div className={sectionVariant({ className: "flex flex-col lg:w-2/3" })}>
        <CartContentData />
        <CartSummery />
      </div>
      <div className={sectionVariant({ className: "flex flex-col lg:w-1/3" })}>
        <CartActions />
      </div>
    </div>
  )
}, "CartContent")

export default function StoreCard() {
  return (
    <MainWrapperPage>
      <div className="flex flex-col gap-4 w-full h-full">
        <div className="flex items-center gap-2">
          <Button onClick={() => window.history.back()} className="px-2 gap-2 bg-neutral-800">
            <IconArrowLeft size={24} className='text-neutral-400' />
            <Typography className="text-base font-semibold">
              Вернуться
            </Typography>
          </Button>
          <Typography className="text-3xl font-semibold">
            Корзина
          </Typography>
        </div>
        <CartContent />
      </div>
    </MainWrapperPage>
  )
}