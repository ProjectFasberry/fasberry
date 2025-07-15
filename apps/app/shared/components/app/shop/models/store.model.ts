import { createOrderBodySchema } from '@repo/shared/schemas/payment/payment-schema';
import { toast } from 'sonner';
import { reatomAsync, reatomResource, withCache, withDataAtom, withStatusesAtom } from "@reatom/async"
import { atom } from "@reatom/core"
import { sleep, withReset } from "@reatom/framework"
import { CurrencyString, PAYMENT_CURRENCIES_MAPPING, PaymentCurrency } from "@repo/shared/constants/currencies"
import ky from "ky"
import { z } from 'zod/v4';
import { client } from '@/shared/api/client';
import type { Currencies } from "@repo/shared/types/db/sqlite-database-types"
import type { Selectable } from "kysely"
import type { StoreItem as item } from "@repo/shared/types/entities/store"

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

type PaymentOrder = {
  status: "success" | "error" | "canceled" | "pending";
  nickname: string;
  created_at: Date | null;
  orderid: string;
  payment_type: string;
  payment_value: string;
}

export type StoreItem = item

export type PaymentValueType = string | number
export type PaymentType = "donate" | "belkoin" | "charism" | "item" | "event"

export type StoreCategory = "donate" | "events" | "all"
export type StoreWalletFilter = "game" | "real" | "all"
export type StorePayMethod = "card" | "sbp"

export const FIAT_CURRENCY = ["RUB"]

export const paymentResult = atom<PaymentResult | null>(null, "paymentResult").pipe(withReset())
export const paymentResultType = atom<PaymentResultType | null>(null, "paymentResultType").pipe(withReset())
export const paymentResultDialogIsOpen = atom(false, "paymentResultDialogIsOpen")

export const storeTargetNickname = atom<string>("", "storeTargetNickname").pipe(withReset())

export const storeCurrencyAtom = atom<PaymentCurrency>("RUB", "storeCurrency").pipe(withReset())
export const storePayMethodAtom = atom<StorePayMethod>("card", "storePayMethod").pipe(withReset())

export const storeCategoryAtom = atom<StoreCategory>("all", "storeCategory").pipe(withReset())
export const storeWalletFilterAtom = atom<StoreWalletFilter>("all", "storeWalletFilter")

export const storePrivacyAtom = atom(false, "privacy").pipe(withReset())

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
    const res = await client(`payment/get-order/${values.current}`, { 
      searchParams: { type }, signal: ctx.controller.signal
    })
    
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
  const walletType = ctx.spy(storeWalletFilterAtom)

  return await ctx.schedule(async () => {
    await sleep(200);

    const res = await client("store/items", {
      searchParams: {
        type, wallet: walletType
      },
      signal: ctx.controller.signal
    });

    const data = await res.json<WrappedResponse<StoreItem[]>>();

    if ("error" in data) return []

    return data.data
  })
}, "itemsResource").pipe(withStatusesAtom(), withCache(), withDataAtom([]))

export const priceByCurrencyAction = reatomAsync(async (ctx, currency: string) => {
  if (FIAT_CURRENCY.includes(currency)) return;

  return await ctx.schedule(async () => {
    async function getCurrencyPriceByRub<T extends CurrencyString>(
      convertedCurrency: T
    ): Promise<{ [key in T]: { rub: number } }> {
      // @ts-expect-error
      const currencyId = PAYMENT_CURRENCIES_MAPPING[convertedCurrency]

      const res = await ky("https://api.coingecko.com/api/v3/simple/price", { 
        searchParams: { "ids": currencyId, "vs_currencies": "rub" } 
      })

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
    const res = await client("store/payment/currencies", { 
      signal: ctx.controller.signal 
    })

    const data = await res.json<WrappedResponse<Selectable<Currencies>[]>>()

    if ("error" in data) return null

    return data.data
  })
}, "currenciesResource").pipe(withStatusesAtom(), withCache(), withDataAtom())

const createPaymentActionVariables = atom<z.infer<typeof createOrderBodySchema> | null>(null)

export const createPaymentAction = reatomAsync(async (ctx) => {

}, {
  name: "createPaymentAction",
  onFulfill: (ctx, res) => {
    
  },
  onReject: (ctx, e) => {
    e instanceof Error && toast.error(e.message)
  }
}).pipe(withStatusesAtom())