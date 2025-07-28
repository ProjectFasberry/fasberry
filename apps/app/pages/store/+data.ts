import { cartDataAtom, getBasketData, StoreBasket } from "@/shared/components/app/shop/models/store-cart.model";
import { snapshotAtom } from "@/shared/lib/ssr";
import { createCtx } from "@reatom/core";
import { PageContextServer } from "vike/types";

export const data = async (pageContext: PageContextServer) => {
  const ctx = createCtx()
  const headers = pageContext.headers

  let data: StoreBasket[] = []

  if (headers) {
    data = await getBasketData({ headers })
    cartDataAtom(ctx, data)
  }

  const snapshot = ctx.get(snapshotAtom)

  const prevSnapshot = pageContext.snapshot
  const newSnapshot = { ...prevSnapshot, ...snapshot }

  pageContext.snapshot = newSnapshot
}