import { action, atom } from "@reatom/core";
import { isDeepEqual, reatomAsync, withAssign, withDataAtom, withReset, withStatusesAtom } from "@reatom/framework";
import { withLocalStorage } from "@reatom/persist-web-storage";
import { z } from "zod/v4"
import { itemsResource, Payment, StoreItem } from "./store.model";
import { currentUserAtom } from "@/shared/models/current-user.model";
import { JsonValue } from "@repo/shared/types/db/auth-database-types";
import { client } from "@/shared/api/client";
import { toast } from "sonner";

export type StoreBasket = {
  id: number,
  title: string,
  imageUrl: string,
  price: number,
  description: JsonValue | null,
  summary: string,
  details: {
    selected: boolean,
    for: string | null
  }
}

const nicknameSchema = z.string()
  .min(3, "Минимум 3 символа")
  .max(16, "Максимум 16 символов")
  .regex(/^[a-zA-Z0-9_]+$/, "Только латинские буквы, цифры и подчёркивание");

export const CART_DATA_COOKIE_KEY = "cart-data"
export const CART_DATA_SSR_KEY = "cartData"

export const cartDataAtom = atom<StoreBasket[]>([], "cartData").pipe(
  withAssign((bucket) => ({
    removeItem: action((ctx, id: number) =>
      bucket(ctx, (state) => state.filter(d => d.id !== id)))
  })),
  withLocalStorage({ key: CART_DATA_COOKIE_KEY })
)

export const cartIsValidAtom = atom<boolean>((ctx) => ctx.spy(cardDataSelectedAtom).length >= 1)
export const cardDataSelectedAtom = atom((ctx) => ctx.spy(cartDataAtom).filter(t => t.details.selected), "cardDataSelected")
export const cartMenuIsOpenAtom = atom(false, "cartMenuIsOpen")

export const cartPriceAtom = atom<number>((ctx) => {
  const target = ctx.spy(cardDataSelectedAtom)
  return target.length === 0 ? 0 : target.reduce((total, item) => total + item.price, 0);
}, "cartPrice")

export const selectCartItem = action((ctx, id: number) => {
  cartDataAtom(ctx, (state) => {
    const idx = state.findIndex(target => target.id === id);
    if (idx === -1) return state;

    const newItem = {
      ...state[idx],
      details: {
        ...state[idx].details,
        selected: !state[idx].details.selected
      }
    }

    return [
      ...state.slice(0, idx),
      newItem,
      ...state.slice(idx + 1)
    ]
  })
}, "selectCartItem")

export const removeFromCart = action((ctx, id: number) => {
  cartDataAtom(ctx, (state) => {
    const index = state.findIndex(target => target.id === id)
    if (index === -1) return state

    return [
      ...state.slice(0, index),
      ...state.slice(index + 1)
    ]
  })
}, "removeFromCart")

export const newRecipientAtom = atom<string | null>(null, "newRecipient").pipe(withReset())
export const oldRecipientAtom = atom<string | null>(null, "oldRecipientAtom").pipe(withReset())
export const changeRecipientDialogIsOpen = atom(false, "changeRecipientDialogIsOpen")

changeRecipientDialogIsOpen.onChange((ctx, state) => {
  if (!state) {
    newRecipientAtom.reset(ctx)
    oldRecipientAtom.reset(ctx)
  }
})

export const changeRecipient = action((ctx, id: number) => {
  const newRecipient = ctx.get(newRecipientAtom)

  if (newRecipient && newRecipient.length <= 2) return;

  cartDataAtom(ctx, (state) => {
    const idx = state.findIndex(target => target.id === id);
    if (idx === -1) return state;

    const newItem = {
      ...state[idx],
      details: {
        ...state[idx].details,
        for: newRecipient
      }
    }

    return [
      ...state.slice(0, idx),
      newItem,
      ...state.slice(idx + 1)
    ]
  })

  changeRecipientDialogIsOpen(ctx, false)
}, "changeRecipient")

export const changeRecipientIsValidAtom = atom<boolean>((ctx) => {
  const newValue = ctx.spy(newRecipientAtom) ?? ""
  const oldValue = ctx.spy(oldRecipientAtom)
  const isEqual = isDeepEqual(oldValue, newValue)

  const result = newValue.length >= 1 ? isEqual : true

  return !result
}, "changeRecipientIsValid")

export const openRecipientChangeDialog = action((ctx, recipient: string | null) => {
  changeRecipientDialogIsOpen(ctx, true)
  oldRecipientAtom(ctx, recipient)
  newRecipientAtom(ctx, recipient)
}, "openRecipientChangeDialog")

const defaultCartOpts = {
  selected: true
}

export const selectItemToCart = action(async (ctx, id: number) => {
  const items = ctx.get(itemsResource.dataAtom)

  let item: StoreItem | null = null;

  if (items.length >= 1) {
    const target = items.find(target => target.id === id)

    if (target) {
      item = target
    }
  }

  if (!item) {
    const target = await client(`store/item/${id}`).json<WrappedResponse<StoreItem>>()

    if ("error" in target) {
      throw new Error(target.error)
    }

    if (target) {
      item = target.data
    }
  }
  
  if (!item) return;

  const currentUser = ctx.get(currentUserAtom)

  let isUpdated: boolean = false;

  cartDataAtom(ctx, (state) => {
    const define: StoreBasket = {
      ...item,
      details: {
        ...defaultCartOpts,
        for: currentUser ? currentUser.nickname : null,
      }
    }

    const isExists = Boolean(state.find(entry => entry.id === define.id))

    if (isExists) {
      isUpdated = false

      return state.map(entry =>
        entry.id === define.id ? define : entry
      )
    } else {
      isUpdated = true

      return [...state, define]
    }
  })

  if (isUpdated) {
    cartMenuIsOpenAtom(ctx, true)
  }
}, "selectStoreItem")

export const storeOrdersListAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(async () => {
    const res = await client("store/orders", { throwHttpErrors: false })
    const data = await res.json<WrappedResponse<unknown>>()

    if ("error" in data) {
      throw new Error(data.error)
    }

    return data.data as Payment[]
  })
}, {
  name: "storeOrdersListAction",
  onReject: (_, e) => {
    e instanceof Error && toast.error(e.message)
  }
}).pipe(withDataAtom([]), withStatusesAtom())

export const storeActiveOrdersAtom = atom((ctx) =>
  ctx.spy(storeOrdersListAction.dataAtom).filter(target => target.status === 'succeeded'), "storeActiveOrders"
)

export const storePendingOrdersAtom = atom((ctx) => {
  ctx.spy(storeOrdersListAction.dataAtom).filter(target => target.status === 'pending'), "storePendingOrders"
})