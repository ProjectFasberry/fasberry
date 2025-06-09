import { useQueryClient } from '@tanstack/react-query';
import { HTMLAttributes, useState } from 'react';
import { Typography } from '@repo/landing-ui/src/typography';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@repo/landing-ui/src/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Button } from '@repo/landing-ui/src/button';
import { cva, VariantProps } from 'class-variance-authority';
import { PRICE_BY_CURRENCY_QUERY_KEY } from './shop-price';
import CreditCardIcon from "@repo/assets/images/credit-card.webp"
import SBPIcon from "@repo/assets/images/sbp.jpg"
import { useQuery } from '@tanstack/react-query';
import { SHOP_ITEM_QUERY_KEY, ShopItemQuery, shopItemQuery } from './shop';
import { CURRENCIES_API } from '@repo/shared/constants/api';
import { PaymentCurrency } from '@repo/shared/constants/currencies';

const currencyItemVariants = cva(`
  flex cursor-pointer items-center backdrop-blur-xl transition-all 
  justify-between p-4 rounded-lg border-2 bg-neutral-400/80 dark:bg-neutral-700/80 border-transparent`, {
  variants: {
    variant: {
      default: "",
      selected: "border-neutral-800 dark:border-neutral-400",
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

const UpdatePrice = () => {
  const qc = useQueryClient()
  const { data } = shopItemQuery()

  const currency = data?.currency

  const updatePrice = async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await qc.refetchQueries({ queryKey: PRICE_BY_CURRENCY_QUERY_KEY(currency) })
  }

  return (
    <Button
      disabled={currency === 'RUB'}
      onClick={updatePrice}
      className="rounded-lg bg-neutral-400 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700"
    >
      <Typography className="text-[14px] lg:text-[16px] text-black dark:text-white">
        Обновить цену
      </Typography>
    </Button>
  )
}

type Currency = {
  id: string, 
  value: string, 
  imageUrl: string, 
  title: string, 
  status: string,
  isAvailable: boolean
}

async function getCurrencies() {
  const res = await CURRENCIES_API("get-currencies")
  const data = await res.json<{ data: Array<Currency> } | { error: string }>()

  if ("error" in data) return null

  return data.data
}

export const currenciesQuery = () => useQuery({
  queryKey: ["currencies"],
  queryFn: () => getCurrencies(),
  refetchOnMount: false,
  refetchOnWindowFocus: false
})

export const ShopSelectCurrency = () => {
  const qc = useQueryClient();
  const [selCurrency, setSelCurrency] = useState<PaymentCurrency | null>(null);
  const [open, setOpen] = useState(false);
  const { data: currencies } = currenciesQuery();
  const { data: shopItemState } = shopItemQuery();

  const currency = shopItemState?.currency;
  const fiatMethod = shopItemState?.fiatMethod;

  const selectCurrency = () => {
    setOpen(false);

    qc.setQueryData(SHOP_ITEM_QUERY_KEY,
      (p: ShopItemQuery) => ({ ...p, currency: selCurrency })
    );
  };

  const selectFiatMethod = (fiatMethod: ShopItemQuery["fiatMethod"]) => {
    qc.setQueryData(SHOP_ITEM_QUERY_KEY,
      (p: ShopItemQuery) => ({ ...p, fiatMethod })
    );
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between w-full lg:items-center gap-2">
      <Typography size="base" text_color="adaptiveWhiteBlack">
        Метод оплаты
      </Typography>
      <div className="flex items-center gap-2 w-fit">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <div
              className="flex group max-w-1/3 overflow-hidden gap-2 border-2 dark:border-neutral-600 bg-white/80 
            border-neutral-300 dark:bg-background-dark/80 lg:px-6 px-4 py-1 lg:py-2 rounded-lg"
            >
              <Typography className="text-[14px] lg:text-[16px] text-background-dark/80 dark:text-white">
                {currency ?? 'выбрать'}
              </Typography>
            </div>
          </DialogTrigger>
          <DialogContent className="p-0 !max-w-2xl">
            <VisuallyHidden>
              <DialogTitle>
                Выберите способ оплаты
              </DialogTitle>
            </VisuallyHidden>
            <div
              className="flex items-center p-4 border-2 border-neutral-700 rounded-xl h-full w-full"
            >
              <div className="flex flex-col w-full gap-4">
                <Typography size="xl" className="text-center">
                  Выберите способ оплаты
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 auto-rows-auto w-full h-full">
                  {!currencies && (
                    <Typography size="lg">Доступных валют нет :/</Typography>
                  )}
                  {currencies && (
                    currencies.map((currency) => (
                      <CurrencyItem
                        key={currency.id}
                        onClick={() => setSelCurrency(currency.value as PaymentCurrency)}
                        // @ts-ignore
                        variant={!currency.isAvailable
                          ? 'disabled'
                          : selCurrency === currency.value
                            ? 'selected'
                            : 'default'
                        }
                      >
                        <img
                          src={currency.imageUrl}
                          alt=""
                          width={36}
                          height={36}
                          className="rounded-3xl"
                        />
                        <Typography className="text-xl" text_color="adaptiveWhiteBlack" >
                          {currency.title}
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
                        <img src={SBPIcon.src} alt="" width={36} height={36} />
                        <Typography>
                          СБП
                        </Typography>
                      </CurrencyItem>
                      <CurrencyItem
                        variant={fiatMethod === 'creditCard' ? 'selected' : 'default'}
                        onClick={() => selectFiatMethod('creditCard')}
                      >
                        <img src={CreditCardIcon.src} alt="" width={36} height={36} />
                        <Typography>
                          Карта
                        </Typography>
                      </CurrencyItem>
                    </div>
                  </div>
                )}
                <div className="flex flex-col lg:flex-row gap-2 items-center justify-between w-full">
                  <Typography size="base" className="text-neutral-800 dark:text-neutral-400">
                    {selCurrency !== 'RUB' && '[!] Оплата будет через телеграм-бота'}
                  </Typography>
                  <div className="flex items-center lg:w-fit w-full gap-2">
                    <Button
                      onClick={selectCurrency}
                      className="py-2 w-full group rounded-lg hover:bg-[#05b458] 
                      bg-[#088d47] hover:duration-300 duration-100 ease-in-out  backdrop-filter backdrop-blur-lg"
                    >
                      <Typography className="text-lg text-white">
                        Выбрать
                      </Typography>
                    </Button>
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
};