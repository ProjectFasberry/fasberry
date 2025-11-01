import { atom, batch, createCtx, Ctx } from "@reatom/core";
import { reatomAsync, sleep, withCache, withDataAtom, withInit, withStatusesAtom } from "@reatom/framework";
import { DEFAULT_SOFT_TIMEOUT, Payment } from "./store.model";
import { withSsr } from "@/shared/lib/ssr";
import { PageContextServer } from "vike/types";
import { logError } from "@/shared/lib/log";
import { mergeSnapshot } from "@/shared/lib/snapshot";
import { CartFinalPrice } from "@repo/shared/types/entities/store";
import type { CartItem, CartPayload } from "@repo/shared/types/entities/store"
import { client, withAbort, withJsonBody, withLogging, withQueryParams } from "@/shared/lib/client-wrapper";
import { isEmptyArray } from "@/shared/lib/array";
import { isAuthAtom } from "@/shared/models/page-context.model";
import { getRecipient, setRecipientValueAtom, validateRecItem } from "./store-recipient.model";
import { currentUserAtom } from "@/shared/models/current-user.model";
import { simulate } from "./store-item-status.model";
import { cartDataAtom } from "./store-cart.model.atoms";

export async function getCartData(init?: RequestInit) {
  return client<CartPayload>("store/cart/list", init)
    .pipe(withAbort(init?.signal))
    .exec()
}

export const cartDataSelectedAtom = atom<CartItem[]>(
  (ctx) => ctx.spy(cartDataAtom).filter(t => t.selected)
).pipe(
  withInit((ctx) => ctx.get(cartDataAtom).filter(t => t.selected))
);

export const cartDataItemIsSelectAtom = (id: number) => atom((ctx) => {
  const data = ctx.spy(cartDataSelectedAtom).find(d => d.id === id)

  return data?.selected ?? false
}, `${id}.selectedStatus`)

export const cartPriceAtom = atom<CartFinalPrice>({ BELKOIN: 0, CHARISM: 0 }, "cartPrice").pipe(withSsr("cartPrice"))

export const cartWarningDialogIsOpenAtom = atom(false, "cartWarningDialogIsOpen")
export const cartWarningDialogDataAtom = atom<{ title: string, description: string } | null>(null, "cartWarningDialogData")

export const cartIsValidAtom = atom((ctx) => {
  const productsLengthValidate = ctx.spy(cartDataSelectedAtom).length >= 1;
  const productsRecipientValidate = ctx.spy(cartDataSelectedAtom).filter(target => target.recipient).length >= 1

  return productsLengthValidate && productsRecipientValidate
}, "cartIsValidAtom")

type OrdersParams = {
  type?: "all" | "succeeded" | "pending"
}

export async function getOrders(params: OrdersParams, init: RequestInit) {
  return client<Payment[]>("store/order/list", { ...init, throwHttpErrors: false })
    .pipe(withQueryParams(params))
    .exec()
}

export const storeOrdersListAction = reatomAsync(async (ctx) => {
  await ctx.schedule(() => sleep(DEFAULT_SOFT_TIMEOUT));

  return await ctx.schedule(() => getOrders({ type: "all" }, { signal: ctx.controller.signal }))
}, {
  name: "storeOrdersListAction",
  onReject: (_, e) => {
    logError(e)
  }
}).pipe(
  withDataAtom(null, (_, data) => isEmptyArray(data) ? null : data), 
  withStatusesAtom(), 
  withCache({ swr: false })
)

export const storeCartFilterAtom = atom<"pending" | "succeeded" | "all">("all", "storeCartFilter")

export const storeCartFilteresOrdersAtom = atom((ctx) => {
  const filter = ctx.spy(storeCartFilterAtom);

  let data: Payment[] = [];

  if (filter === 'succeeded') {
    const orders = ctx.spy(storeOrdersListAction.dataAtom)
    data = orders ? orders.filter(target => target.status === 'succeeded') : []
  }

  if (filter === 'pending') {
    const orders = ctx.spy(storeOrdersListAction.dataAtom)

    data = orders ? orders.filter(target => target.status === 'pending') : []
  }

  if (filter === 'all') {
    data = ctx.spy(storeOrdersListAction.dataAtom) ?? []
  }

  return data
}, "storeCartFilteresOrders")

export async function defineCartData(pageContext: PageContextServer) {
  const headers = pageContext.headers

  const ctx = createCtx();

  if (headers) {
    const data = await getCartData({ headers })

    cartPriceAtom(ctx, data.price)
    cartDataAtom(ctx, data.products)
  }

  const newSnapshot = mergeSnapshot(ctx, pageContext)

  pageContext.snapshot = newSnapshot
}

export const addItemToCartAction = reatomAsync(async (ctx, id: number) => {
  const isAuth = ctx.get(isAuthAtom);

  if (!isAuth) {
    const isExist = validateRecItem(ctx, id)

    if (!isExist) return;
  } else {
    const currentUser = ctx.get(currentUserAtom)
    if (!currentUser) throw new Error('Current user is not defined')

    setRecipientValueAtom(ctx, currentUser.nickname)
  }

  simulate(ctx, id, "load")

  const recipient = getRecipient(ctx)

  try {
    await ctx.schedule(() => sleep(60));

    const result = await ctx.schedule(() =>
      client
        .post<boolean>("store/cart/add")
        .pipe(withJsonBody({ id, recipient }), withLogging())
        .exec()
    )

    return { id, result }
  } catch (e) {
    simulate(ctx, id, 'unload');
    throw e
  }
}, {
  name: "addItemToCartAction",
  onFulfill: (ctx, res) => {
    if (!res) return;

    const { result, id } = res

    if (!id) {
      console.warn("Store target id is not defined")
      throw new Error("Store target id is not defined")
    }

    batch(ctx, () => {
      simulate(ctx, id, "select")
      simulate(ctx, id, "unload");
    })

    updateCart(ctx)
    setRecipientValueAtom.reset(ctx);
  },
  onReject: (ctx, e) => {
    logError(e, { type: "combined" })

    setRecipientValueAtom.reset(ctx);
  }
}).pipe(withStatusesAtom())


export async function updateCart(ctx: Ctx) {
  const data = await getCartData()

  batch(ctx, () => {
    cartDataAtom(ctx, data.products)
    cartPriceAtom(ctx, data.price);
  })
}
