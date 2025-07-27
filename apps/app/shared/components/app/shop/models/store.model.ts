import { createOrderSchema } from '@repo/shared/schemas/payment';
import { toast } from 'sonner';
import { reatomAsync, reatomResource, withCache, withDataAtom, withStatusesAtom } from "@reatom/async"
import { atom } from "@reatom/core"
import { sleep, withReset } from "@reatom/framework"
import { PaymentCurrency } from "@repo/shared/constants/currencies"
import { z } from 'zod/v4';
import { client } from '@/shared/api/client';
import type { Currencies } from "@repo/shared/types/db/sqlite-database-types"
import type { Selectable } from "kysely"
import type { StoreItem as item } from "@repo/shared/types/entities/store"
import { cardDataSelectedAtom } from './store-cart.model';
import { CreateOrderRoutePayload } from "@repo/shared/types/entities/payment"
import { navigate } from 'vike/client/router';
import { Payments } from "@repo/shared/types/db/payments-database-types"
import { nanoid } from "nanoid"

export type StoreItem = item
export type Payment = Selectable<Payments>

type StoreCategory = "donate" | "events" | "all"
type StoreWalletFilter = "game" | "real" | "all"
type StorePayMethod = "card" | "sbp"

const FIAT_CURRENCY = ["RUB"]

export const storeTargetNickname = atom<string>("", "storeTargetNickname").pipe(withReset())
export const storeCurrencyAtom = atom<PaymentCurrency>("RUB", "storeCurrency").pipe(withReset())
export const storePayMethodAtom = atom<StorePayMethod>("card", "storePayMethod").pipe(withReset())
export const storeCategoryAtom = atom<StoreCategory>("all", "storeCategory").pipe(withReset())
export const storeWalletFilterAtom = atom<StoreWalletFilter>("all", "storeWalletFilter")
export const storePrivacyAtom = atom(false, "privacy").pipe(withReset())

export const itemsResource = reatomResource(async (ctx) => {
  const type = ctx.spy(storeCategoryAtom)
  const walletType = ctx.spy(storeWalletFilterAtom)

  return await ctx.schedule(async () => {
    await sleep(60);

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

export const currenciesResource = reatomResource(async (ctx) => {
  return await ctx.schedule(async () => {
    const res = await client("store/currencies", {
      throwHttpErrors: false,
      signal: ctx.controller.signal,
    })

    const data = await res.json<WrappedResponse<Selectable<Currencies>[]>>()

    if ("error" in data) return null

    return data.data
  })
}, "currenciesResource").pipe(withStatusesAtom(), withCache(), withDataAtom())

type CreateOrder = z.infer<typeof createOrderSchema>

export const createdPaymentDataAtom = atom<CreateOrderRoutePayload | null>(null)

export const createPaymentAction = reatomAsync(async (ctx) => {
  const method = ctx.get(storePayMethodAtom)
  const currency = ctx.get(storeCurrencyAtom);

  const details: CreateOrder["details"] = {
    method, currency: "USDT"
  }

  const selectedItems = ctx.get(cardDataSelectedAtom)

  const items: CreateOrder["items"] = selectedItems
    .filter(target => typeof target.details.for === "string")
    .map(target => ({
      id: target.id,
      recipient: target.details.for as string,
    }));

  return await ctx.schedule(async () => {
    const res = await client.post("store/create-order", {
      json: { items, details },
      throwHttpErrors: false,
      signal: ctx.controller.signal
    })
  
    const data = await res.json<WrappedResponse<CreateOrderRoutePayload>>()
  
    if ("error" in data) {
      throw new Error(data.error)
    }
  
    const { data: { gamePurchase, realPurchase, payload } } = data;
  
    if (!gamePurchase && !realPurchase) {
      throw new Error("Произошла какая-то ошибка")
    }
  
    return { gamePurchase, realPurchase, payload }
  })
}, {
  name: "createPaymentAction",
  onFulfill: (ctx, res) => {
    if (!res) return;

    let navigateTo: string;

    if (res.realPurchase) {
      navigateTo = `/store/order/${res.realPurchase.uniqueId}`
    }

    ctx.schedule(() => {
      createdPaymentDataAtom(ctx, res)
      navigate(navigateTo)
    })
  },
  onReject: (_, e) => {
    e instanceof Error && toast.error(e.message)
  }
}).pipe(withStatusesAtom())