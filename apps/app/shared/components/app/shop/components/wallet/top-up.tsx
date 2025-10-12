import { validateNumber } from "@/shared/lib/validate-primitives";
import { getStaticImage } from "@/shared/lib/volume-helpers";
import { reatomComponent } from "@reatom/npm-react";
import { Input } from "@repo/ui/input";
import { Typography } from "@repo/ui/typography";
import {
  topUpAction,
  topUpAvailableCurrenciesAtom,
  topUpCommentAtom,
  topUpValidationErrorAtom,
  topUpExchangeRatesAction,
  topUpIsValidAtom,
  topUpMethodCurrencyAtom,
  topUpMethodsAction,
  topUpMethodTypeAtom,
  topUpRecipientAtom,
  topUpTargetAtom,
  topUpValueAtom,
  topUpResultErrorAtom
} from "../../models/store-top-up.model";
import { tv } from "tailwind-variants";
import { Button } from "@repo/ui/button";
import { AtomState } from "@reatom/core";
import { Skeleton } from "@repo/ui/skeleton";
import { belkoinImage, charismImage, TARGET_TITLE } from "../cart/store-price";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/popover";
import { IconExchange } from "@tabler/icons-react";

const boostsImg = getStaticImage("icons/boosts_icon.png")

const itemVariant = tv({
  base: `px-4 h-14 cursor-pointer w-full gap-2
    flex items-center justify-start rounded-xl data-[state=false]:bg-neutral-900 data-[state=true]:bg-neutral-700`
})

const TopUpTarget = reatomComponent<{
  title: string, img: string, value: AtomState<typeof topUpTargetAtom>
}>(({ ctx, img, title, value }) => {
  const current = ctx.spy(topUpTargetAtom);

  return (
    <div
      data-state={current === value}
      onClick={() => topUpTargetAtom(ctx, value)}
      className={itemVariant()}
    >
      <div className="flex items-center h-8 w-8 rounded-lg overflow-hidden">
        <img src={img} className="h-8 w-8 object-cover" alt="" />
      </div>
      <Typography className="font-semibold text-lg">{title}</Typography>
    </div>
  )
}, "TopUpTarget")

const TopUpTargets = () => {
  return (
    <div className="flex items-center gap-2 justify-start w-full">
      <TopUpTarget title="Харизма" value="CHARISM" img={charismImage} />
      <TopUpTarget title="Белкоин" value="BELKOIN" img={belkoinImage} />
    </div>
  )
}

const TopUpValue = reatomComponent(({ ctx }) => {
  return (
    <Input
      type="text"
      maxLength={8}
      className="px-4 w-full lg:w-1/3"
      placeholder="Количество"
      value={ctx.spy(topUpValueAtom)}
      onChange={e => {
        const value = validateNumber(e.target.value);

        if (value !== null) {
          topUpValueAtom(ctx, value)
        }
      }}
    />
  )
}, "TopUpValue")

const TopUpComment = reatomComponent(({ ctx }) => {
  return (
    <Input
      value={ctx.spy(topUpCommentAtom) ?? ""}
      onChange={e => topUpCommentAtom(ctx, e.target.value)}
      placeholder="Комментарий (необязательно)"
    />
  )
}, "TopUpComment")

const TopUpError = reatomComponent(({ ctx }) => {
  const validationError = ctx.spy(topUpValidationErrorAtom);
  const resultError = ctx.spy(topUpResultErrorAtom)
  if (!validationError && !resultError) return null;

  const message = resultError?.message ?? validationError?.message
  if (!message) return null;

  return (
    <span className="text-red-500 text-base text-nowrap truncate">
      {message}
    </span>
  )
}, "TopUpError")

const TopUpMethod = reatomComponent<{
  method: NonNullable<AtomState<typeof topUpMethodsAction.dataAtom>>[number]
}>(({ ctx, method }) => {
  const current = ctx.spy(topUpMethodTypeAtom);

  return (
    <div
      data-state={current === method.value as AtomState<typeof topUpMethodTypeAtom>}
      className={itemVariant()}
      onClick={() => topUpMethodTypeAtom(ctx, method.value as AtomState<typeof topUpMethodTypeAtom>)}
    >
      <div className="flex items-center h-8 w-8 rounded-lg overflow-hidden">
        <img src={method.imageUrl} className="h-8 w-8 object-cover" alt="" />
      </div>
      <Typography className="font-semibold text-lg">{method.title}</Typography>
    </div>
  )
}, "TopUpMethod")

const TopUpMethodsSkeleton = () => {
  return (
    <div className="grid grid-cols-3 auto-rows-auto gap-2 w-full h-full">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className={itemVariant()} data-state={false}>
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-12" />
        </div>
      ))}
    </div>
  )
}

const TopUpMethods = reatomComponent(({ ctx }) => {
  const data = ctx.spy(topUpMethodsAction.dataAtom);

  if (ctx.spy(topUpMethodsAction.statusesAtom).isPending) {
    return <TopUpMethodsSkeleton />
  }

  if (!data) return null;

  return (
    <div className="grid sm:grid-cols-3 grid-cols-1 auto-rows-auto gap-2 w-full h-full">
      {data.map((method) => (
        <TopUpMethod key={method.id} method={method} />
      ))}
    </div>
  )
}, 'TopUpMethods')

const TopUpCurrency = reatomComponent<{ currency: AtomState<typeof topUpMethodCurrencyAtom> }>(({ ctx, currency }) => {
  const current = ctx.spy(topUpMethodCurrencyAtom)

  return (
    <div
      data-state={current === currency}
      className={itemVariant()}
      onClick={() => topUpMethodCurrencyAtom(ctx, currency)}
    >
      <Typography className="font-semibold">
        {currency}
      </Typography>
    </div>
  )
}, "TopUpCurrency")

const TopUpRecipient = reatomComponent(({ ctx }) => {
  return (
    <Input
      value={ctx.spy(topUpRecipientAtom)}
      onChange={e => topUpRecipientAtom(ctx, e.target.value)}
      placeholder="Получатель"
    />
  )
}, "TopUpRecipient")

const TopUpCurrencies = reatomComponent(({ ctx }) => {
  const data = ctx.spy(topUpAvailableCurrenciesAtom);
  if (!data) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 auto-rows-auto gap-2 w-full h-full">
      {data.map((currency) => (
        <TopUpCurrency key={currency} currency={currency} />
      ))}
    </div>
  )
}, "TopUpCurrencies")

const TopUpSubmit = reatomComponent(({ ctx }) => {
  const isDisabled = !ctx.spy(topUpIsValidAtom) || ctx.spy(topUpAction.statusesAtom).isPending;

  return (
    <Button
      className="bg-neutral-50 px-4 w-full"
      onClick={() => topUpAction(ctx)}
      disabled={isDisabled}
    >
      <Typography className="text-lg text-neutral-950 font-semibold">
        Оплатить
      </Typography>
    </Button>
  )
}, "TopUpSubmit")

const TopUpExchangesSkeleton = () => {
  return (
    <div className="flex items-center w-full sm:min-w-1/3 sm:w-fit h-full gap-2">
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-10 w-20" />
    </div>
  )
}

const TopUpExchanges = reatomComponent(({ ctx }) => {
  const data = ctx.spy(topUpExchangeRatesAction.dataAtom);

  if (ctx.spy(topUpExchangeRatesAction.statusesAtom).isPending) {
    return <TopUpExchangesSkeleton />
  }

  if (!data) return null;

  return (
    <div className="flex items-center w-full sm:min-w-1/3 sm:w-fit h-full gap-2">
      {data.map((entry) => (
        <Popover key={entry.type}>
          <PopoverTrigger>
            <div className="flex bg-neutral-900 px-4 py-2 rounded-lg cursor-pointer items-center gap-2 w-full">
              <Typography className="text-lg">
                {TARGET_TITLE[entry.type as keyof typeof TARGET_TITLE]}
              </Typography>
              <IconExchange size={16} className="text-neutral-400" />
            </div>
          </PopoverTrigger>
          <PopoverContent>
            <div className="flex flex-col gap-2 w-full h-full">
              <Typography className="text-neutral-400">
                Курс на текущий момент
              </Typography>
              <div className='flex flex-col gap-1 w-full'>
                {Object.entries(entry.values).map(([currency, value]) => (
                  <div key={currency}>
                    ~ {value.toFixed(2)} {currency}
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  )
}, "TopUpExchanges")

export const TopUp = () => {
  return (
    <div className="flex flex-col h-full gap-4 w-full">
      <div className="flex items-center gap-4 rounded-lg p-3 bg-blue-600/70 backdrop-blur-md">
        <img src={boostsImg} width={102} height={102} alt="" />
        <div className="flex flex-col gap-1 *:font-medium text-lg">
          <Typography>1. Введите желаемое кол-во валюты</Typography>
          <Typography>2. Выберите способ оплаты</Typography>
          <Typography>3. Оплатите</Typography>
        </div>
      </div>
      <div className="flex flex-col gap-6 w-full h-full">
        <div className="flex flex-col gap-2 w-full h-full">
          <Typography className="text-xl font-semibold">
            У каждой валюты своя себестоимость относительно выбранной валюты
          </Typography>
          <TopUpExchanges />
        </div>
        <TopUpRecipient />
        <div className="flex flex-col gap-2 w-full h-full">
          <div className="flex flex-col gap-1 w-full h-full">
            <Typography className="text-lg">
              Игровая валюта
            </Typography>
            <div className="flex w-full sm:min-w-1/3 sm:w-fit h-full">
              <TopUpTargets />
            </div>
          </div>
          <div className="flex flex-col gap-1 w-full h-full">
            <Typography className="text-lg">
              Количество
            </Typography>
            <TopUpValue />
          </div>
        </div>
        <div className="flex flex-col gap-1 w-full h-full">
          <Typography className="text-lg">
            Метод оплаты
          </Typography>
          <TopUpMethods />
        </div>
        <div className="flex flex-col gap-1 w-full h-full">
          <Typography className="text-lg">
            Валюта
          </Typography>
          <TopUpCurrencies />
        </div>
        <div className="flex flex-col gap-1 min-w-1/3 w-full sm:w-fit h-full">
          <Typography className="text-lg">
            Дополнительное
          </Typography>
          <TopUpComment />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between w-full h-full gap-2">
          <div className="min-w-0">
            <TopUpError />
          </div>
          <div className="flex grow w-full sm:max-w-1/4">
            <TopUpSubmit />
          </div>
        </div>
      </div>
    </div>
  )
}