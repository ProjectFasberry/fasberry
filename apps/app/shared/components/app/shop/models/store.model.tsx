import { reatomAsync, withStatusesAtom } from "@reatom/async"
import { action, atom, batch, createCtx } from "@reatom/core"
import { sleep, withConcurrency, withReset } from "@reatom/framework"
import type { Selectable } from "kysely"
import type { OrderType, StoreItemsPayload } from "@repo/shared/types/entities/store"
import { CreateOrderRoutePayload } from "@repo/shared/types/entities/payment"
import { navigate } from 'vike/client/router';
import { Payments } from "@repo/shared/types/db/payments-database-types"
import { withSsr } from '@/shared/lib/ssr';
import { logError } from '@/shared/lib/log';
import { mergeSnapshot } from '@/shared/lib/snapshot';
import { PageContextServer } from 'vike/types';
import { toast } from 'sonner';
import { client, withQueryParams } from '@/shared/lib/client-wrapper';
import { clientInstance } from "@/shared/api/client"
import { TopUpButton } from '../components/wallet/top-up-button';
import { DEFAULT_SOFT_TIMEOUT } from '@/shared/consts/delays';
import { withSearchParamsPersist } from '@reatom/url';

export type Payment = Selectable<Payments>

type StoreCategory = "donate" | "event" | "all"
type StoreWalletFilter = "CHARISM" | "BELKOIN" | "ALL"

export type StoreItemsParams = {
  type: StoreCategory,
  wallet: StoreWalletFilter,
  searchQuery: string | undefined
}

export const storeCategoryAtom = atom<StoreCategory>("all", "storeCategory").pipe(
  withSearchParamsPersist('c', (c = "all") => c),
  withReset(),
)

export const storeWalletFilterAtom = atom<StoreWalletFilter>("ALL", "storeWalletFilter").pipe(
  withSearchParamsPersist('w', (w = "ALL") => w),
)

export const storeItemsSearchQueryAtom = atom<string>("", "storeItemsSearchQuery").pipe(
  withSearchParamsPersist('sq', (sq = "") => sq)
);

export const storePrivacyAtom = atom(false, "privacy").pipe(withReset())

export async function getStoreItems(params: StoreItemsParams, init?: RequestInit) {
  return client<StoreItemsPayload>("store/items", init)
    .pipe(withQueryParams(params))
    .exec()
}

export const storeItemsDataAtom = atom<StoreItemsPayload["data"] | null>(null, "storeItemsData").pipe(withSsr("storeItemsData"))
export const storeItemsMetaAtom = atom<StoreItemsPayload["meta"] | null>(null, "storeItemsMeta").pipe(withSsr("storeItemsMeta"))

export const storeItemsIsPendingAtom = atom((ctx) => ctx.spy(storeItemsAction.statusesAtom).isPending, "storeItemsIsPending")

storeCategoryAtom.onChange((ctx) => storeItemsAction(ctx))
storeWalletFilterAtom.onChange((ctx) => storeItemsAction(ctx))

export const onChange = action(async (ctx, e: React.ChangeEvent<HTMLInputElement>) => {
  const { value } = e.target;
  storeItemsSearchQueryAtom(ctx, value)

  await ctx.schedule(() => sleep(DEFAULT_SOFT_TIMEOUT))

  storeItemsAction(ctx)
}, "onChange").pipe(withConcurrency())

export const storeItemsAction = reatomAsync(async (ctx) => {
  await ctx.schedule(() => sleep(DEFAULT_SOFT_TIMEOUT));

  const params: StoreItemsParams = {
    type: ctx.get(storeCategoryAtom),
    wallet: ctx.get(storeWalletFilterAtom),
    searchQuery: ctx.get(storeItemsSearchQueryAtom)
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
    logError(e, { type: "combined" })
  }
}).pipe(withStatusesAtom())


// 
export const createdOrderDataAtom = atom<CreateOrderRoutePayload | null>(null)

export const getOrderUrl = (uniqueId: string, t: Exclude<OrderType, "all"> = "default") => `/store/order/status/${uniqueId}?type=${t}`

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

    const url = getOrderUrl(res.purchase.uniqueId, "default");

    ctx.schedule(() => {
      createdOrderDataAtom(ctx, res);
      navigate(url)
    })
  },
  onReject: (ctx, e) => {
    logError(e);

    if (e instanceof Error) {
      if (e.message === 'insufficient') {
        toast.error("Недостаточно баланса", {
          action: <TopUpButton />
        })
        return;
      }

      if (e.message === 'items-not-found') {
        toast.error("Товары не найдены или устарели")
        return;
      }

      toast.error("Произошла ошибка при создании заказа", { description: "Повтори попытку позже" })
    }
  }
}).pipe(withStatusesAtom())


// 
export async function defineStoreItemsData(pageContext: PageContextServer) {
  const headers = pageContext.headers;

  const ctx = createCtx();

  if (headers) {
    const type = pageContext.urlParsed.search["c"] ?? "all"
    const wallet = pageContext.urlParsed.search["w"] ?? "ALL"
    const searchQuery = pageContext.urlParsed.search["sq"] ?? undefined;

    const res = await clientInstance("store/items", { searchParams: { type, wallet, searchQuery }, headers });
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
