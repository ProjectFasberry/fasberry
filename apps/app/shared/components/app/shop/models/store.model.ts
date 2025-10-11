import { createOrderSchema, paymentCurrencySchema } from '@repo/shared/schemas/payment';
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async"
import { atom, batch, createCtx } from "@reatom/core"
import { sleep, withReset } from "@reatom/framework"
import { z } from 'zod';
import type { Currencies } from "@repo/shared/types/db/sqlite-database-types"
import type { Selectable } from "kysely"
import type { StoreItemsPayload } from "@repo/shared/types/entities/store"
import { CreateOrderRoutePayload } from "@repo/shared/types/entities/payment"
import { navigate } from 'vike/client/router';
import { Payments } from "@repo/shared/types/db/payments-database-types"
import { withSsr } from '@/shared/lib/ssr';
import { logError } from '@/shared/lib/log';
import { mergeSnapshot } from '@/shared/lib/snapshot';
import { PageContextServer } from 'vike/types';
import { toast } from 'sonner';
import { client, withAbort, withQueryParams } from '@/shared/lib/client-wrapper';
import { clientInstance } from "@/shared/api/client"

export type Payment = Selectable<Payments>

type StoreCategory = "donate" | "event" | "all"
type StoreWalletFilter = "CHARISM" | "BELKOIN" | "ALL"

export const storeTargetNicknameAtom = atom<string>("", "storeTargetNickname").pipe(withReset())
export const storeCurrencyAtom = atom<z.infer<typeof paymentCurrencySchema>>("RUB", "storeCurrency").pipe(withReset())
export const storePayMethodAtom = atom<CreateOrder["method"]>("card", "storePayMethod").pipe(withReset())
export const storeCategoryAtom = atom<StoreCategory>("all", "storeCategory").pipe(withReset())
export const storeWalletFilterAtom = atom<StoreWalletFilter>("ALL", "storeWalletFilter")
export const storePrivacyAtom = atom(false, "privacy").pipe(withReset())

async function getStoreItems(
  { type, wallet }: { type: StoreCategory, wallet: StoreWalletFilter },
  init?: RequestInit
) {
  return client<StoreItemsPayload>("store/items", init)
    .pipe(withQueryParams({ type, wallet }))
    .exec()
}

export const storeItemsDataAtom = atom<StoreItemsPayload["data"] | null>(null, "storeItemsData").pipe(withSsr("storeItemsData"))
export const storeItemsMetaAtom = atom<StoreItemsPayload["meta"] | null>(null, "storeItemsMeta").pipe(withSsr("storeItemsMeta"))

export const storeItemsIsPendingAtom = atom((ctx) => ctx.spy(storeItemsAction.statusesAtom).isPending, "storeItemsIsPending")

export const storeItemsAction = reatomAsync(async (ctx) => {
  const type = ctx.get(storeCategoryAtom)
  const wallet = ctx.get(storeWalletFilterAtom)

  await ctx.schedule(() => sleep(200));

  return await ctx.schedule(() => getStoreItems({ type, wallet }))
}, {
  name: "storeItemsAction",
  onFulfill: (ctx, { data, meta }) => {
    batch(ctx, () => {
      storeItemsDataAtom(ctx, data)
      storeItemsMetaAtom(ctx, meta)
    })
  },
  onReject: (_, e) => {
    logError(e)
  }
}).pipe(withStatusesAtom())

storeCategoryAtom.onChange((ctx) => storeItemsAction(ctx))
storeWalletFilterAtom.onChange((ctx) => storeItemsAction(ctx))

type CurrenciesPayload = Selectable<Currencies>[]

export const currenciesAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(() =>
    client<CurrenciesPayload>("store/currencies", { throwHttpErrors: false })
      .pipe(withAbort(ctx.controller.signal))
      .exec()
  )
}, "currenciesAction").pipe(withStatusesAtom(), withCache(), withDataAtom(null))

type CreateOrder = z.infer<typeof createOrderSchema>

export const createdOrderDataAtom = atom<CreateOrderRoutePayload | null>(null)

const getOrderUrl = (id: string) => `/store/order/${id}`

export const createOrderAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(() =>
    client
      .post<CreateOrderRoutePayload>("store/order/create", { throwHttpErrors: false })
      .exec()
  )
}, {
  name: "createOrderAction",
  onFulfill: (ctx, res) => {
    if (!res) return;

    ctx.schedule(() => {
      createdOrderDataAtom(ctx, res);
      navigate(getOrderUrl(res.purchase.uniqueId))
    })
  },
  onReject: (_, e) => {
    logError(e);

    console.log(e);
    
    if (e instanceof Error) {
      if (e.message === 'insufficient') {
        toast.error("Недостаточно баланса")
      }

      if (e.message === 'items-not-found') {
        toast.error("Товары не найдены или устарели")
      }
    }
  }
}).pipe(withStatusesAtom())

export async function defineStoreItemsData(pageContext: PageContextServer) {
  const headers = pageContext.headers;

  const ctx = createCtx();

  if (headers) {
    const res = await clientInstance("store/items", { searchParams: { type: "all", wallet: "ALL" }, headers });
    const data = await res.json<WrappedResponse<StoreItemsPayload>>();

    if ("error" in data) {
      throw new Error(data.error)
    }

    const payload = data.data

    // set/update the client_id
    const setCookieValue = res.headers.getSetCookie()

    if (setCookieValue.length >= 1) {
      pageContext.headersResponse = res.headers
    }

    storeItemsDataAtom(ctx, payload.data);
    storeItemsMetaAtom(ctx, payload.meta);
  }

  const newSnapshot = mergeSnapshot(ctx, pageContext)

  pageContext.snapshot = newSnapshot
}