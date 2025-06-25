import { HTMLAttributes, useState } from 'react';
import CreditCardIcon from "@repo/assets/images/credit-card.webp"
import SBPIcon from "@repo/assets/images/sbp.jpg"
import { PaymentCurrency } from '@repo/shared/constants/currencies';
import { reatomComponent } from '@reatom/npm-react';
import { tv, VariantProps } from 'tailwind-variants';
import { Typography } from '@/shared/ui/typography';
import { currenciesResource, priceByCurrencyAction, StoreItem, storeItem } from './store.model';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';

const currencyItemVariants = tv({
  base: `flex cursor-pointer items-center backdrop-blur-xl
  justify-between p-4 rounded-lg border-2 bg-neutral-700/80 border-transparent`,
  variants: {
    variant: {
      default: "",
      selected: "border-neutral-400",
      disabled: "opacity-40 pointer-events-none"
    }
  },
  defaultVariants: {
    variant: "default"
  }
})

type CurrencyItemProps = VariantProps<typeof currencyItemVariants> & HTMLAttributes<HTMLDivElement>

const CurrencyItem = ({ variant, className, ...props }: CurrencyItemProps) => {
  return <div className={currencyItemVariants({ variant, className })} {...props} />
}

const UpdatePrice = reatomComponent(({ ctx }) => {
  const { currency } = ctx.spy(storeItem)

  const updatePrice = async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await priceByCurrencyAction(ctx, currency)
  }

  return (
    <button
      disabled={currency === 'RUB'}
      onClick={updatePrice}
      className="btn rounded-lg bg-neutral-800 hover:bg-neutral-700"
    >
      <Typography color="white" className="text-[14px] lg:text-[16px]">
        Обновить цену
      </Typography>
    </button>
  )
}, "UpdatePrice")

export const ShopSelectCurrency = reatomComponent(({ ctx }) => {
  const [selCurrency, setSelCurrency] = useState<PaymentCurrency | null>(null);
  const [open, setOpen] = useState(false);
  const currencies = ctx.spy(currenciesResource.dataAtom);
  const shopItemState = ctx.spy(storeItem);

  const currency = shopItemState?.currency;
  const fiatMethod = shopItemState?.fiatMethod;

  const selectCurrency = () => {
    if (!selCurrency) return;

    setOpen(false);
    storeItem(ctx, (state) => ({ ...state, currency: selCurrency }));
  };

  const selectFiatMethod = (target: StoreItem["fiatMethod"]) => storeItem(ctx, (state) => ({ ...state, fiatMethod: target }))

  return (
    <div className="flex flex-col sm:flex-row justify-between w-full lg:items-center gap-2">
      <Typography color="white" className="text-base">
        Метод оплаты
      </Typography>
      <div className="flex items-center gap-2 w-fit">
        <Dialog open={open} onOpenChange={v => setOpen(v)}>
          <DialogTrigger
            className='flex group max-w-1/3 overflow-hidden gap-2 border-2 border-neutral-600 bg-background-dark/80 lg:px-6 px-4 py-1 lg:py-2 rounded-lg'
          >
            <Typography color="white" className="text-[14px] lg:text-[16px]">
              {currency ?? 'выбрать'}
            </Typography>
          </DialogTrigger>
          <DialogContent className="p-0 max-w-2xl">
            <DialogTitle className='hidden'>Выберите способ оплаты</DialogTitle>
            <div className="flex items-center p-4 border-2 border-neutral-700 rounded-xl h-full w-full">
              <div className="flex flex-col w-full gap-4">
                <Typography className="text-xl text-center">Выберите способ оплаты</Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 auto-rows-auto w-full h-full">
                  {!currencies && (
                    <Typography className="text-lg">Доступных валют нет :/</Typography>
                  )}
                  {currencies && (
                    currencies.map(({ id, title, imageUrl, isAvailable, value }) => (
                      <CurrencyItem
                        key={id}
                        onClick={() => setSelCurrency(value as PaymentCurrency)}
                        variant={!isAvailable ? 'disabled' : selCurrency === value ? 'selected' : 'default'}
                      >
                        <img src={imageUrl} alt="" width={36} height={36} className="rounded-3xl" />
                        <Typography className="text-xl" color="white">
                          {title}
                        </Typography>
                      </CurrencyItem>
                    )))}
                </div>
                {currency === 'RUB' && (
                  <div className="flex flex-col gap-4 w-full h-fit">
                    <div className="flex items-center *:w-full gap-2">
                      <CurrencyItem
                        variant={fiatMethod === 'sbp' ? 'selected' : 'default'}
                        onClick={() => selectFiatMethod('sbp')}
                      >
                        <img src={SBPIcon} alt="" width={36} height={36} />
                        <Typography>
                          СБП
                        </Typography>
                      </CurrencyItem>
                      <CurrencyItem
                        variant={fiatMethod === 'card' ? 'selected' : 'default'}
                        onClick={() => selectFiatMethod('card')}
                      >
                        <img src={CreditCardIcon} alt="" width={36} height={36} />
                        <Typography>Банковская карта</Typography>
                      </CurrencyItem>
                    </div>
                  </div>
                )}
                <div className="flex flex-col lg:flex-row gap-2 items-center justify-between w-full">
                  <Typography color="gray" className="text-base text-neutral-400">
                    {selCurrency !== 'RUB' && 'Оплата проходит через телеграм-бота'}
                  </Typography>
                  <div className="flex items-center lg:w-fit w-full gap-2">
                    <button
                      onClick={selectCurrency}
                      className="btn py-2 w-full rounded-lg hover:bg-[#05b458] bg-[#088d47] duration-300 backdrop-blur-lg"
                    >
                      <Typography className="text-lg text-white">
                        Выбрать
                      </Typography>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <UpdatePrice />
      </div>
    </div>
  );
}, "ShopSelectCurrency")