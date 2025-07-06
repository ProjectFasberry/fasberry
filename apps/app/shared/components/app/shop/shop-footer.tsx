import { Typography } from "@repo/ui/typography";
import { reatomComponent } from "@reatom/npm-react";
import { currenciesResource, storeCurrencyAtom, storePayMethodAtom } from "./store.model";
import { Button } from "@repo/ui/button";
import { HTMLAttributes, useState } from 'react';
import CreditCardIcon from "@repo/assets/images/credit-card.webp"
import SBPIcon from "@repo/assets/images/sbp.jpg"
import { PaymentCurrency } from '@repo/shared/constants/currencies';
import { tv, VariantProps } from 'tailwind-variants';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@repo/ui/dialog';
import { atom } from '@reatom/core';

const currencyItemVariants = tv({
  base: `flex cursor-pointer items-center backdrop-blur-xl
    justify-between p-4 rounded-lg border-2 bg-neutral-700/80 border-transparent`,
  variants: {
    variant: {
      default: "",
      selected: "border-green",
      disabled: "opacity-40 pointer-events-none"
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

const CurrenciesList = reatomComponent(({ ctx }) => {
  const [previewCurrency, setPreviewCurrency] = useState<PaymentCurrency | null>(null);

  const currencies = ctx.spy(currenciesResource.dataAtom);
  const currency = ctx.spy(storeCurrencyAtom)
  const fiatMethod = ctx.spy(storePayMethodAtom)

  const selectCurrency = () => {
    if (!previewCurrency) return;

    selectCurrencyDialogIsOpenAtom(ctx, false);
    storeCurrencyAtom(ctx, previewCurrency);
  };

  return (
    <>
      {currencies ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 auto-rows-auto w-full h-full">
          {currencies.map(({ id, title, imageUrl, isAvailable, value }) => (
            <CurrencyItem
              key={id}
              onClick={() => setPreviewCurrency(value as PaymentCurrency)}
              variant={isAvailable ? previewCurrency === value ? 'selected' : 'default' : 'disabled'}
            >
              <img src={imageUrl} loading="lazy" alt="" width={36} height={36} className="rounded-3xl" />
              <Typography className="text-xl" color="white">
                {title}
              </Typography>
            </CurrencyItem>
          ))}
        </div>
      ) : (
        <Typography color="gray" className="text-lg">Доступных валют нет :/</Typography>
      )}
      {currency === 'RUB' && (
        <div className="flex flex-col gap-4 w-full h-fit">
          <div className="flex items-center *:w-full gap-2">
            <CurrencyItem
              variant={fiatMethod === 'sbp' ? 'selected' : 'default'}
              onClick={() => storePayMethodAtom(ctx, 'sbp')}
            >
              <img src={SBPIcon} alt="" width={36} height={36} />
              <Typography>СБП</Typography>
            </CurrencyItem>
            <CurrencyItem
              variant={fiatMethod === 'card' ? 'selected' : 'default'}
              onClick={() => storePayMethodAtom(ctx, 'card')}
            >
              <img src={CreditCardIcon} alt="" width={36} height={36} />
              <Typography>Банковская карта</Typography>
            </CurrencyItem>
          </div>
        </div>
      )}
      <div className="flex flex-col lg:flex-row gap-2 items-center justify-between w-full">
        <Typography color="gray" className="text-base">
          {previewCurrency !== 'RUB' && 'Для оплаты нужен телеграм'}
        </Typography>
        <div className="flex items-center lg:w-fit w-full gap-2">
          <Button
            onClick={selectCurrency} className="w-full hover:bg-[#05b458] bg-[#088d47]"
          >
            <Typography color="white" className="text-lg">
              Выбрать
            </Typography>
          </Button>
        </div>
      </div>
    </>
  )
}, "CurrenciesList")

const selectCurrencyDialogIsOpenAtom = atom(false, "selectCurrencyDialigIsOpen")

const SelectedCurrency = reatomComponent(({ ctx }) => {
  const currency = ctx.spy(storeCurrencyAtom)

  return <Typography color="white" className="text-sm lg:text-base">{currency}</Typography>
})

export const ShopSelectCurrency = reatomComponent(({ ctx }) => {
  return (
    <Dialog
      open={ctx.spy(selectCurrencyDialogIsOpenAtom)}
      onOpenChange={v => selectCurrencyDialogIsOpenAtom(ctx, v)}
    >
      <DialogTrigger
        className='flex max-w-1/3 cursor-pointer overflow-hidden gap-2 border-2 border-neutral-600 lg:px-6 px-4 py-2 rounded-lg'
      >
        <SelectedCurrency />
      </DialogTrigger>
      <DialogContent className="p-0 max-w-2xl">
        <DialogTitle className="text-xl text-center">Выберите способ оплаты</DialogTitle>
        <div className="flex items-center p-4 overflow-y-auto border-2 border-neutral-700 rounded-xl h-full w-full">
          <CurrenciesList />
        </div>
      </DialogContent>
    </Dialog>
  );
}, "ShopSelectCurrency")