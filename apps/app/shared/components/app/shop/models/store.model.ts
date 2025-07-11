import { createOrderBodySchema } from '@repo/shared/schemas/payment/payment-schema';
import { toast } from 'sonner';
import { reatomAsync, reatomResource, withCache, withDataAtom, withStatusesAtom } from "@reatom/async"
import { action, atom, AtomState } from "@reatom/core"
import { sleep, withAssign, withReset } from "@reatom/framework"
import { CurrencyString, PAYMENT_CURRENCIES_MAPPING, PaymentCurrency } from "@repo/shared/constants/currencies"
import ky from "ky"
import { z } from 'zod/v4';
import { BASE } from '@/shared/api/client';
import type { Currencies } from "@repo/shared/types/db/sqlite-database-types"
import type { Selectable } from "kysely"
import type { Donate, Economy } from "@repo/shared/types/db/payments-database-types"

export type OrderResponse = {
  status: "canceled" | "pending" | "success" | "error";
  created_at: Date | null;
  nickname: string;
  orderid: string;
  payment_type: string;
  payment_value: string;
}

export type PaymentResult = {
  current: string,
  paymentType: "crypto" | "fiat",
  status: OrderResponse["status"],
  url: string
}

export type PaymentResultType = "created" | "error"
export type Donates = Selectable<Donate>
export type Wallets = Selectable<Economy>
export type Events = { type: string; title: string; description: string; wallet: string; price: number }

type PaymentOrder = {
  status: "success" | "error" | "canceled" | "pending";
  nickname: string;
  created_at: Date | null;
  orderid: string;
  payment_type: string;
  payment_value: string;
}

export type PaymentValueType = string | number
export type PaymentType = "donate" | "belkoin" | "charism" | "item" | "event"

export type StoreCategory = "donate" | "wallet" | "events"

export type StoreItem = {
  type: PaymentType | null;
  value: PaymentValueType | null
}

export type StoreBasket = { 
  id: number, 
  title: string, 
  value: string, 
  img: string, 
  price: number 
}

export const FIAT_CURRENCY = ["RUB"]

export const paymentResult = atom<PaymentResult | null>(null, "paymentResult").pipe(withReset())
export const paymentResultType = atom<PaymentResultType | null>(null, "paymentResultType").pipe(withReset())
export const paymentResultDialogIsOpen = atom(false, "paymentResultDialogIsOpen")

export const storeTargetNickname = atom<string>("", "storeTargetNickname").pipe(withReset())
export const storeItem = atom<StoreItem>({ type: null, value: null }, "storeItem").pipe(withReset())
export const storeCategoryAtom = atom<StoreCategory>("donate", "storeCategory").pipe(withReset())
export const storeCurrencyAtom = atom<PaymentCurrency>("RUB", "storeCurrency").pipe(withReset())
export const storePayMethodAtom = atom<"card" | "sbp">("card", "storePayMethod").pipe(withReset())

export const storePrivacyAtom = atom(false, "privacy").pipe(withReset())

export const storeBasketDataAtom = atom<StoreBasket[]>([], "basketDataAtom").pipe(
  withAssign((bucket) => ({
    removeItem: action((ctx, target: number) => 
      bucket(ctx, (state) => state.filter(d => d.id !== target)))
  }))
)

export const selectStoreItem = action((
  ctx, type: PaymentType, value: PaymentValueType | "arkhont" | "loyal" | "authentic"
) => {
  const current = ctx.get(storeItem)?.value
  if (current === value) return;;

  const item = { type, value }

  storeItem(ctx, (state) => ({ ...state, ...item }))

  function getItemDetails() {
    const items = ctx.get(itemsResource.dataAtom)

    if (type === 'donate') {
      const donates = items as Donates[];
      return donates.find(t => t.origin === value)
    }

    return null;
  }

  const details = getItemDetails()
  if (!details) return;

  storeBasketDataAtom(ctx, (state) => {
    const definedItem: StoreBasket = {
      id: state.length + 1,
      title: details.title,
      price: Number(details.price),
      img: details.imageUrl,
      value: item.value as string
    }

    // todo: impl unique id for item
    const filtered = state.filter(ex => ex.title !== definedItem.title)

    return [...filtered, definedItem]
  })

  basketIsOpen(ctx, true)
}, "selectStoreItem")

export const basketIsOpen = atom(false, "basketIsOpen")

export const basketPriceAtom = atom<number>((ctx) => {
  const target = ctx.spy(storeBasketDataAtom)
  return target.length === 0 ? 0 : target.reduce((total, item) => total + item.price, 0);
}, "basketPrice")

paymentResult.onChange((ctx, target) => {
  if (!target) return;

  if (target.status === 'success' || target.status === 'canceled') {
    paymentResult.reset(ctx)
    paymentResultType.reset(ctx)
    paymentResultDialogIsOpen(ctx, false)
  }
})

export const paymentStatusAction = reatomAsync(async (
  ctx, values: Pick<PaymentResult, "current" | "paymentType">
) => {
  await sleep(1000);

  const type = values.paymentType

  return await ctx.schedule(async () => {
    const res = await BASE(`payment/get-order/${values.current}`, { searchParams: { type }, signal: ctx.controller.signal })
    const data = await res.json<WrappedResponse<PaymentOrder>>()

    if ("error" in data) throw new Error(data.error)

    return data.data;
  })
}, {
  name: "paymentStatusAction",
  onFulfill: (ctx, res) => {
    if (!res) return;

    paymentResult(ctx, (state) => state ? ({ ...state, status: res.status }) : null)
  },
  onReject: (ctx, e) => {
    e instanceof Error && toast.error(e.message)
    paymentResult(ctx, (state) => state ? ({ ...state, status: 'error' }) : null)
  }
}).pipe(withStatusesAtom())

export const itemsResource = reatomResource(async (ctx) => {
  const type = ctx.spy(storeCategoryAtom)

  return await ctx.schedule(async () => {
    const res = await BASE("shared/store/items", { searchParams: { type }, signal: ctx.controller.signal });
    const data = await res.json<WrappedResponse<unknown[]>>();

    if ("error" in data) return null;

    return data.data.length > 0 ? data.data : null
  })
}, "itemsResource").pipe(withStatusesAtom(), withCache(), withDataAtom())

export const priceByCurrencyAction = reatomAsync(async (ctx, currency: string) => {
  if (FIAT_CURRENCY.includes(currency)) return;

  return await ctx.schedule(async () => {
    async function getCurrencyPriceByRub<T extends CurrencyString>(convertedCurrency: T): Promise<{ [key in T]: { rub: number } }> {
      // @ts-expect-error
      const currencyId = PAYMENT_CURRENCIES_MAPPING[convertedCurrency]
      const res = await ky.get("https://api.coingecko.com/api/v3/simple/price", { searchParams: { "ids": currencyId, "vs_currencies": "rub" } })
      const data = await res.json<{ [key in T]: { rub: number } }>()

      return data;
    }

    const res = await getCurrencyPriceByRub(currency)

    if (Object.keys(res).length === 0) return null;

    return res
  })
}, {
  name: "priceByCurrencyAction",
  onReject: (_, e) => e instanceof Error && toast.error(e.message)
}).pipe(withDataAtom(), withStatusesAtom())

export const currenciesResource = reatomResource(async (ctx) => {
  return await ctx.schedule(async () => {
    const res = await BASE("payment/currencies", { signal: ctx.controller.signal })
    const data = await res.json<WrappedResponse<Selectable<Currencies>[]>>()

    if ("error" in data) return null

    return data.data
  })
}, "currenciesResource").pipe(withStatusesAtom(), withCache(), withDataAtom())

const createPaymentActionVariables = atom<z.infer<typeof createOrderBodySchema> | null>(null)

export const createPaymentAction = reatomAsync(async (ctx) => {
  const { type: paymentType, value: paymentValue } = ctx.get(storeItem)
  const currency = ctx.get(storeCurrencyAtom)
  const fiatMethod = ctx.get(storePayMethodAtom)
  const nickname = ctx.get(storeTargetNickname)

  if (!paymentType || !paymentValue) return;

  const json: AtomState<typeof createPaymentActionVariables> = {
    currency, fiatMethod, nickname, paymentType, paymentValue, privacy: true
  }

  createPaymentActionVariables(ctx, json)

  return await ctx.schedule(async () => {
    const res = await BASE.post("payment/create-order", { json, signal: ctx.controller.signal })
    const data = await res.json<WrappedResponse<{ url: string, orderId: string }>>()

    if ("error" in data) throw new Error(data.error)

    return data
  })
}, {
  name: "createPaymentAction",
  onFulfill: (ctx, res) => {
    if (!res) return;

    const variables = ctx.get(createPaymentActionVariables)
    if (!variables) return;

    if ("data" in res) {
      paymentResult(ctx, {
        current: res.data.orderId,
        status: "pending",
        url: res.data.url,
        paymentType: variables.currency === 'RUB' ? "fiat" : "crypto"
      })

      paymentResultType(ctx, "created")
      paymentResultDialogIsOpen(ctx, true)
    }
  },
  onReject: (ctx, e) => {
    e instanceof Error && toast.error(e.message)
    paymentResultType(ctx, "error")
  }
}).pipe(withStatusesAtom())