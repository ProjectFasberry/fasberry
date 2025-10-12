import { atom, createCtx } from "@reatom/core";
import { reatomAsync, withDataAtom, withInit, withStatusesAtom } from "@reatom/framework";
import { Payment } from "./store.model";
import { withSsr } from "@/shared/lib/ssr";
import { PageContextServer } from "vike/types";
import { logError } from "@/shared/lib/log";
import { mergeSnapshot } from "@/shared/lib/snapshot";
import { CartFinalPrice } from "@repo/shared/types/entities/store";
import type { CartItem, CartPayload } from "@repo/shared/types/entities/store"
import { client, withAbort, withQueryParams } from "@/shared/lib/client-wrapper";

export async function getCartData(init?: RequestInit) {
  return client<CartPayload>("store/cart/list", init)
    .pipe(withAbort(init?.signal))
    .exec()
}

export const cartDataAtom = atom<CartPayload["products"]>([], "cartData").pipe(withSsr("cartData"))

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
  return await ctx.schedule(() => getOrders({ type: "all" }, { signal: ctx.controller.signal }))
}, {
  name: "storeOrdersListAction",
  onReject: (_, e) => {
    logError(e)
  }
}).pipe(withDataAtom([]), withStatusesAtom())

export const storeCartFilterAtom = atom<"pending" | "succeeded" | "all">("all", "storeCartFilter")

export const storeCartFilteresOrdersAtom = atom((ctx) => {
  const filter = ctx.spy(storeCartFilterAtom);

  let data: Payment[] = [];

  if (filter === 'succeeded') {
    data = ctx.spy(storeOrdersListAction.dataAtom)
      .filter(target => target.status === 'succeeded')
  }

  if (filter === 'pending') {
    data = ctx.spy(storeOrdersListAction.dataAtom)
      .filter(target => target.status === 'pending')
  }

  if (filter === 'all') {
    data = ctx.spy(storeOrdersListAction.dataAtom)
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