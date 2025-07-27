import { Typography } from "@repo/ui/typography";
import { reatomComponent } from "@reatom/npm-react";
import { currenciesResource, storeCurrencyAtom, storePayMethodAtom } from "../../models/store.model";
import { Button } from "@repo/ui/button";
import { HTMLAttributes, useState } from 'react';
import CreditCardIcon from "@repo/assets/images/credit-card.webp"
import SBPIcon from "@repo/assets/images/sbp.jpg"
import { PaymentCurrency } from '@repo/shared/constants/currencies';
import { tv, VariantProps } from 'tailwind-variants';
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from '@repo/ui/dialog';
import { action, atom } from '@reatom/core';
import { Skeleton } from "@repo/ui/skeleton";

const currencyItemVariants = tv({
  base: `flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg border-transparent`,
  variants: {
    variant: {
      default: "",
      selected: "bg-neutral-50 text-neutral-950",
      disabled: "opacity-40 pointer-events-none"
    },
  },
  defaultVariants: {
    variant: "default"
  }
})

const agregatorVariants = tv({
  base: `flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg border-transparent`,
  variants: {
    variant: {
      default: ``,
      selected: `border-2 border-green-600`
    }
  },
  defaultVariants: {
    variant: "default"
  }
})

const CurrencyItem = ({
  variant, className, ...props
}: VariantProps<typeof currencyItemVariants> & HTMLAttributes<HTMLDivElement>) => {
  return <div className={currencyItemVariants({ variant, className })} {...props} />
}

const AGREGATORS = ["cryptobot", "youkassa"] as const;

const TIPS: Partial<Record<typeof AGREGATORS[number], string>> = {
  "cryptobot": "Нужен телеграм"
}

const selectCurrency = action((ctx, currency: PaymentCurrency | null) => {
  if (currency) {
    storeCurrencyAtom(ctx, currency);
  }

  selectCurrencyDialogIsOpenAtom(ctx, false);
}, "selectCurrency")

const List = reatomComponent(({ ctx }) => {
  const [previewCurrency, setPreviewCurrency] = useState<PaymentCurrency | null>(null);
  const [system, setSystem] = useState<typeof AGREGATORS[number] | null>(null)

  const currencies = ctx.spy(currenciesResource.dataAtom);

  if (ctx.spy(currenciesResource.statusesAtom).isPending) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    )
  }

  const fiatMethod = ctx.spy(storePayMethodAtom)

  if (!currencies) return null;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
        {AGREGATORS.map((item, idx) => (
          <div
            key={idx}
            className={agregatorVariants({ variant: system === item ? "selected" : "default" })}
            onClick={() => setSystem(item)}
          >
            <img
              src={`https://volume.fasberry.su/static/currencies/${item}.webp`}
              loading="lazy"
              alt=""
              width={36}
              height={36}
              className="rounded-3xl"
            />
            <Typography className="text-xl capitalize">
              {item}
            </Typography>
          </div>
        ))}
      </div>
      {system === 'cryptobot' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 auto-rows-auto max-h-1/3 w-full h-fit overflow-y-auto">
          {currencies.filter(d => d.value !== "RUB").map(({ id, title, imageUrl, isAvailable, value }) => (
            <CurrencyItem
              key={id}
              onClick={() => setPreviewCurrency(value as PaymentCurrency)}
              variant={isAvailable ? previewCurrency === value ? 'selected' : 'default' : 'disabled'}
            >
              <img src={imageUrl} loading="lazy" alt="" width={28} height={28} className="rounded-3xl" />
              <Typography className="text-lg">
                {title}
              </Typography>
            </CurrencyItem>
          ))}
        </div>
      )}
      {system === 'youkassa' && (
        <div className="flex flex-col gap-4 w-full h-fit">
          <div className="flex items-center *:w-full gap-2">
            <CurrencyItem
              variant={fiatMethod === 'sbp' ? 'selected' : 'default'}
              onClick={() => storePayMethodAtom(ctx, 'sbp')}
            >
              <img src={SBPIcon} loading="lazy" alt="" width={28} height={28} />
              <Typography className="text-lg">СБП</Typography>
            </CurrencyItem>
            <CurrencyItem
              variant={fiatMethod === 'card' ? 'selected' : 'default'}
              onClick={() => storePayMethodAtom(ctx, 'card')}
            >
              <img src={CreditCardIcon} alt="" loading="lazy" width={28} height={28} />
              <Typography className="text-lg">Карта</Typography>
            </CurrencyItem>
          </div>
        </div>
      )}
      {system && TIPS[system] && (
        <Typography className="text-base" color="gray">
          {TIPS[system]}
        </Typography>
      )}
      <div className="flex flex-col sm:flex-row gap-2 items-center justify-between w-full">
        <Button
          className="w-full sm:w-2/3 hover:bg-green-800 bg-green-700"
          onClick={() => selectCurrency(ctx, previewCurrency)}
        >
          <Typography color="white" className="text-lg">
            Выбрать
          </Typography>
        </Button>
        <DialogClose asChild>
          <Button className="w-full sm:w-1/3 hover:bg-red-800 bg-red-700">
            <Typography color="white" className="text-lg">
              Отмена
            </Typography>
          </Button>
        </DialogClose>
      </div>
    </>
  )
}, "CurrenciesList")

const selectCurrencyDialogIsOpenAtom = atom(false, "selectCurrencyDialigIsOpen")

const SelectedCurrency = reatomComponent(({ ctx }) => {
  const currency = ctx.spy(storeCurrencyAtom)
  return <Typography color="white" className="text-sm lg:text-md font-semibold">{currency}</Typography>
})

export const StoreSelectCurrency = reatomComponent(({ ctx }) => {
  return (
    <Dialog
      open={ctx.spy(selectCurrencyDialogIsOpenAtom)}
      onOpenChange={v => selectCurrencyDialogIsOpenAtom(ctx, v)}
    >
      <DialogTrigger
        className='flex cursor-pointer hover:bg-neutral-800 overflow-hidden gap-2 border-2 border-neutral-600 !py-0.5 !px-2 rounded-lg'
      >
        <SelectedCurrency />
      </DialogTrigger>
      <DialogContent className="p-4 max-w-xl">
        <DialogTitle className="text-xl text-center">
          Выберите способ оплаты
        </DialogTitle>
        <div className="flex flex-col items-center gap-4 h-fit w-full">
          <List />
        </div>
      </DialogContent>
    </Dialog>
  );
}, "StoreSelectCurrency")