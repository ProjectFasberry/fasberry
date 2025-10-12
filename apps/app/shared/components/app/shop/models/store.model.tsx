import { createOrderSchema, paymentCurrencySchema } from '@repo/shared/schemas/payment';
import { reatomAsync, withStatusesAtom } from "@reatom/async"
import { atom, batch, createCtx } from "@reatom/core"
import { sleep, withReset } from "@reatom/framework"
import { z } from 'zod';
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
import { TopUpButton } from '../components/wallet/top-up-button';

export type Payment = Selectable<Payments>

type StoreCategory = "donate" | "event" | "all"
type StoreWalletFilter = "CHARISM" | "BELKOIN" | "ALL"
export type StoreItemsParams = { type: StoreCategory, wallet: StoreWalletFilter }
type CreateOrder = z.infer<typeof createOrderSchema>

export const storeTargetNicknameAtom = atom<string>("", "storeTargetNickname").pipe(withReset())
export const storeCurrencyAtom = atom<z.infer<typeof paymentCurrencySchema>>("RUB", "storeCurrency").pipe(withReset())
export const storePayMethodAtom = atom<CreateOrder["method"]>("card", "storePayMethod").pipe(withReset())
export const storeCategoryAtom = atom<StoreCategory>("all", "storeCategory").pipe(withReset())
export const storeWalletFilterAtom = atom<StoreWalletFilter>("ALL", "storeWalletFilter")
export const storePrivacyAtom = atom(false, "privacy").pipe(withReset())

export const createdOrderDataAtom = atom<CreateOrderRoutePayload | null>(null)

export async function getStoreItems(params: StoreItemsParams, init?: RequestInit) {
  return client<StoreItemsPayload>("store/items", init)
    .pipe(withQueryParams(params), withAbort(init?.signal))
    .exec()
}

export const storeItemsDataAtom = atom<StoreItemsPayload["data"] | null>(null, "storeItemsData").pipe(withSsr("storeItemsData"))
export const storeItemsMetaAtom = atom<StoreItemsPayload["meta"] | null>(null, "storeItemsMeta").pipe(withSsr("storeItemsMeta"))

export const storeItemsIsPendingAtom = atom((ctx) => ctx.spy(storeItemsAction.statusesAtom).isPending, "storeItemsIsPending")

storeCategoryAtom.onChange((ctx) => storeItemsAction(ctx))
storeWalletFilterAtom.onChange((ctx) => storeItemsAction(ctx))

export const DEFAULT_SOFT_TIMEOUT = 160

const getOrderUrl = (id: string) => `/store/order/${id}`

export const storeItemsAction = reatomAsync(async (ctx) => {
  await ctx.schedule(() => sleep(DEFAULT_SOFT_TIMEOUT));

  const params: StoreItemsParams = {
    type: ctx.get(storeCategoryAtom),
    wallet: ctx.get(storeWalletFilterAtom)
  }

  return await ctx.schedule(() => getStoreItems(params, { signal: ctx.controller.signal }))
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

export const createOrderAction = reatomAsync(async (ctx) => {
  await ctx.schedule(() => sleep(DEFAULT_SOFT_TIMEOUT))

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
  onReject: (ctx, e) => {
    logError(e);

    if (e instanceof Error) {
      if (e.message === 'insufficient') {
        toast.error("Недостаточно баланса", {
          action: <TopUpButton />
        })
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

    if ("error" in data) throw new Error(data.error)

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