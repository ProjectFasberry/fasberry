import { reatomAsync, withStatusesAtom } from "@reatom/async";
import { action, atom, batch } from "@reatom/core";
import { addItemToCartAction, updateCart } from "./store-cart.model";
import { logError } from "@/shared/lib/log";
import type { StoreItem } from "@repo/shared/types/entities/store"
import { client, withJsonBody, withLogging } from "@/shared/lib/client-wrapper";
import { itemStatusesAtom, SelectItemToCartOptions, simulate } from "./store-item-status.model";
import { cartDataAtom } from "./store-cart.model.atoms";

export async function getStoreItem(id: string, init: RequestInit) {
  return client<StoreItem>(`store/item/${id}`, { ...init, throwHttpErrors: false, })
    .pipe(withLogging())
    .exec()
}

export const updateItemSelectedStatus = reatomAsync(async (ctx, id: number) => {
  const current = ctx.get(cartDataAtom).find(target => target.id === id);
  if (!current) throw new Error("Current is not defined")

  const json = { id, key: "selected", value: !current.selected };

  const result = await ctx.schedule(() =>
    client
      .post<boolean>("store/cart/edit")
      .pipe(withJsonBody(json), withLogging())
      .exec()
  )

  return { id, result }
}, {
  name: "updateItemSelectedStatus",
  onFulfill: (ctx, { result, id }) => {
    updateCart(ctx)
  },
  onReject: (_, e) => {
    logError(e, { type: "combined" })
  }
}).pipe(withStatusesAtom())


type UpdateItemStatusOptions =
  | { patch: Partial<SelectItemToCartOptions> }
  | { remove: true }
  | { set: { isSelected: boolean; isLoading: boolean } }

export const updateItemStatus = action((ctx, id: number, options: UpdateItemStatusOptions) => {
  itemStatusesAtom(ctx, (state) => {
    if (!state) return state;

    const next = { ...state };

    if ('remove' in options && options.remove) {
      delete next[id];
    }

    if ('set' in options) {
      next[id] = options.set;
    }

    if ('patch' in options) {
      if (!next[id]) return state;
      next[id] = { ...next[id], ...options.patch };
    }

    return next;
  });
}, 'updateItemStatus');

export const getItemStatus = (id: number) => atom((ctx) => {
  const data = ctx.spy(itemStatusesAtom)
  if (!data) return null;
  return data[id];
}, `getItemStatus.${id}`)

export const handleItemToCart = action((ctx, id: number) => {
  const isSelected = ctx.get(getItemStatus(id))?.isSelected ?? false;

  if (isSelected) {
    removeItemFromCartAction(ctx, id)
  } else {
    addItemToCartAction(ctx, id)
  }
}, "handleItemToCart")

export const removeItemFromCartAction = reatomAsync(async (ctx, id: number) => {
  simulate(ctx, id, "load")

  try {
    const result = await ctx.schedule(() =>
      client
        .delete<boolean>("store/cart/remove")
        .pipe(withJsonBody({ id }), withLogging())
        .exec()
    )

    return { id, result }
  } catch (e) {
    simulate(ctx, id, "unload");
    throw e
  }
}, {
  name: "removeItemFromCartAction",
  onFulfill: (ctx, { id, result }) => {
    if (!id) {
      console.warn("Store target id is not defined")
      throw new Error("Store target id is not defined")
    }

    batch(ctx, () => {
      simulate(ctx, id, "select")
      simulate(ctx, id, "unload");
    })

    batch(ctx, () => {
      updateCart(ctx)
      updateItemStatus(ctx, id, { remove: true })
    });
  },
  onReject: (ctx, e) => {
    logError(e, { type: "combined" })
  },
}).pipe(withStatusesAtom())

