import { action, atom, createCtx } from "@reatom/core";
import { reatomAsync, withDataAtom, withInit, withStatusesAtom } from "@reatom/framework";
import { getStoreItems, Payment, StoreItem, storeItemsDataAtom } from "./store.model";
import { client } from "@/shared/api/client";
import { toast } from "sonner";
import { snapshotAtom, withSsr } from "@/shared/lib/ssr";
import { PageContextServer } from "vike/types";

export type CartBasket = Pick<StoreItem,
  | "id" | "title" | "description" | "summary" | "price" | "command"
  | "currency" | "type" | "value" | "imageUrl"
> & {
  quantity: number;
  selected: boolean;
  for: string | null;
}

export type CartPrice = {
  REAL: number,
  CHARISM: number,
  BELKOIN: number
}

export async function getBasketData(args?: RequestInit) {
  const res = await client("store/basket/list", { throwHttpErrors: false, ...args })
    .json<WrappedResponse<{ products: CartBasket[], price: CartPrice }>>();

  if ("error" in res) throw new Error()

  return res.data;
}

export const cartDataAtom = atom<CartBasket[]>([], "cartData").pipe(withSsr("cartData"))

export const cartDataSelectedAtom = atom(
  (ctx) => ctx.spy(cartDataAtom).filter(t => t.selected), "cardDataSelected"
).pipe(
  withInit((ctx) => {
    const data = ctx.get(cartDataAtom)
    return data.filter(target => target.selected)
  })
)

const cartPriceInit = { REAL: 0, BELKOIN: 0, CHARISM: 0 }
export const cartPriceAtom = atom<CartPrice>(cartPriceInit, "cartPrice").pipe(withSsr("cartPrice"))

export const cartWarningDialogIsOpenAtom = atom(false, "cartWarningDialogIsOpen")
export const cartWarningDialogDataAtom = atom<{ title: string, description: string } | null>(null, "cartWarningDialogData")
export const cartWarningDialogIsContinueAtom = atom(false, "cartWarningDialogIsContinue")

export const validateBeforeSubmit = action((ctx) => {
  const isContinue = ctx.get(cartWarningDialogIsContinueAtom)

  if (!isContinue) {
    const recipientExists = ctx.get(cartDataSelectedAtom)
      .every(target => typeof target.for === 'string')

    if (!recipientExists) {
      cartWarningDialogDataAtom(ctx, {
        title: "У некоторых товаров нет получателя",
        description: "При оформлении они не будут учтены!"
      })

      cartWarningDialogIsOpenAtom(ctx, true)
      return;
    }
  }

  cartWarningDialogIsContinueAtom(ctx, true)
}, "validateBeforeSubmit")

export const cartIsValidAtom = atom((ctx) => {
  const productsLengthValidate = ctx.spy(cartDataSelectedAtom).length >= 1;

  const productsRecipientValidate = ctx.spy(cartDataSelectedAtom)
    .filter(target => target.for).length >= 1;

  return productsLengthValidate && productsRecipientValidate
}, "cartIsValidAtom")

export const storeOrdersListAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(async () => {
    const res = await client("store/orders", { throwHttpErrors: false, signal: ctx.controller.signal })
    const data = await res.json<WrappedResponse<Payment[]>>()

    if ("error" in data) throw new Error(data.error)

    return data.data
  })
}, {
  name: "storeOrdersListAction",
  onReject: (_, e) => e instanceof Error && toast.error(e.message)
}).pipe(withDataAtom([]), withStatusesAtom())

// Filters
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
  const ctx = createCtx()
  const headers = pageContext.headers

  if (headers) {
    const data = await getBasketData({ headers })

    cartPriceAtom(ctx, data.price)
    cartDataAtom(ctx, data.products)
  }

  const snapshot = ctx.get(snapshotAtom)

  const prevSnapshot = pageContext.snapshot
  const newSnapshot = { ...prevSnapshot, ...snapshot }

  console.log("defineCartData")

  pageContext.snapshot = newSnapshot
}

export async function defineStoreItemsData(pageContext: PageContextServer) {
  const ctx = createCtx()
  const headers = pageContext.headers

  if (headers) {
    const data = await getStoreItems({ type: "all", wallet: "all" }, { headers })

    storeItemsDataAtom(ctx, data)
  }

  const snapshot = ctx.get(snapshotAtom)

  const prevSnapshot = pageContext.snapshot
  const newSnapshot = { ...prevSnapshot, ...snapshot }

  console.log("defineStoreItemsData")

  pageContext.snapshot = newSnapshot
}
