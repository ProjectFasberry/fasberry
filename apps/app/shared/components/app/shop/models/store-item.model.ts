import { reatomAsync, withStatusesAtom } from "@reatom/async";
import { action, atom, batch, Ctx } from "@reatom/core";
import { cartDataAtom, getBasketData, cartPriceAtom } from "./store-cart.model";
import { client } from "@/shared/api/client";
import { toast } from "sonner";
import { isDeepEqual, sleep, withInit, withReset } from "@reatom/framework";
import { z } from "zod"
import { logError } from "@/shared/lib/log";
import { StoreItem } from "./store.model";

export async function getStoreItem(id: string, init?: RequestInit) {
  const res = await client(`store/item/${id}`, { ...init, throwHttpErrors: false, })
  const data = await res.json<WrappedResponse<StoreItem>>()
  if ("error" in data) throw new Error(data.error)
  return data.data
}

export const updateItemSelectedStatus = reatomAsync(async (ctx, id: number) => {
  const current = ctx.get(cartDataAtom).find(target => target.id === id);
  if (!current) throw new Error("Current is not defined")

  const json = { id, key: "selected", value: !current.selected };
  const res = await client.post("store/basket/edit", { json }).json<WrappedResponse<boolean>>()

  if ("error" in res) throw new Error(res.error)

  return { id, result: res.data }
}, {
  name: "updateItemSelectedStatus",
  onFulfill: (ctx, { result, id }) => {
    updateCart(ctx)

    cartDataAtom(ctx, (state) => {
      const idx = state.findIndex(target => target.id === id);
      if (idx === -1) return state;

      const item = state[idx]

      return [
        ...state.slice(0, idx),
        { ...item, selected: result },
        ...state.slice(idx + 1)
      ]
    })
  },
  onReject: (_, e) => e instanceof Error && toast.error(e.message)
})

type SelectItemToCartOptions = {
  isSelected: boolean,
  isLoading: boolean
}

type SelectItemToCartStatus = Record<number, SelectItemToCartOptions>

const itemStatusesAtom = atom<SelectItemToCartStatus | null>(null, `itemStatuses`).pipe(
  withInit((ctx) => {
    const target = ctx.get(cartDataAtom)

    const record = target.reduce<SelectItemToCartStatus>((acc, item) => {
      acc[item.id] = {
        isLoading: false,
        isSelected: true
      };

      return acc;
    }, {});

    return record
  }),
  withReset()
);

export const updateItemStatus = action((
  ctx,
  id: number,
  options:
    | { patch: Partial<SelectItemToCartOptions> }
    | { remove: true }
    | { set: { isSelected: boolean; isLoading: boolean } }
) => {
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
    removeItemFromCart(ctx, id)
  } else {
    addItemToCart(ctx, id)
  }
}, "handleItemToCart")

async function updateCart(ctx: Ctx) {
  const data = await getBasketData()
  cartDataAtom(ctx, data.products)
  cartPriceAtom(ctx, data.price)
}

function simulate(ctx: Ctx, id: number, type: "load" | "unload") {
  const isLoading = type === "load";

  itemStatusesAtom(ctx, (state) => ({
    ...state,
    [id]: { isSelected: !isLoading, isLoading },
  }));
}

export const removeItemFromCart = reatomAsync(async (ctx, id: number) => {
  simulate(ctx, id, "load")

  const json = { id }
  const res = await client.delete("store/basket/remove", { json }).json<WrappedResponse<boolean>>()

  if ("error" in res) {
    simulate(ctx, id, "unload")
    throw new Error(res.error)
  }

  await ctx.schedule(() => sleep(60))

  simulate(ctx, id, "unload")

  return { id }
}, {
  name: "removeItemFromCart",
  onFulfill: (ctx, res) => {
    batch(ctx, () => {
      updateCart(ctx)
      updateItemStatus(ctx, res.id, { remove: true })
    })
  },
  onReject: (_, e) => {
    logError(e)
  }
})

export const addItemToCart = reatomAsync(async (ctx, id: number) => {
  simulate(ctx, id, "load")

  const json = { id }
  const res = await client.post("store/basket/add", { json }).json<WrappedResponse<boolean>>()

  if ("error" in res) {
    simulate(ctx, id, "unload")
    throw new Error(res.error)
  }

  await ctx.schedule(() => sleep(100))

  simulate(ctx, id, "unload")
}, {
  name: "addItemToCart",
  onFulfill: (ctx, _) => updateCart(ctx),
  onReject: (_, e) => {
    logError(e)
  }
}).pipe(withStatusesAtom())

// Settings
const nicknameSchema = z.string()
  .min(3, "Минимум 3 символа")
  .max(16, "Максимум 16 символов")
  .regex(/^[a-zA-Z0-9_]+$/, "Только латинские буквы, цифры и подчёркивание");

export const newRecipientAtom = atom<string | null>(null, "newRecipient").pipe(withReset())
export const oldRecipientAtom = atom<string | null>(null, "oldRecipientAtom").pipe(withReset())
export const changeRecipientDialogIsOpen = atom(false, "changeRecipientDialogIsOpen")

changeRecipientDialogIsOpen.onChange((ctx, state) => {
  if (!state) {
    newRecipientAtom.reset(ctx)
    oldRecipientAtom.reset(ctx)
  }
})

export const changeRecipient = reatomAsync(async (ctx, id: number) => {
  const newRecipient = ctx.get(newRecipientAtom)
  if (!newRecipient) return;

  if (newRecipient.length <= 2) return;

  const json = { id, key: "for", value: newRecipient }
  const res = await client.post("store/basket/edit", { json }).json<WrappedResponse<string | boolean>>()

  if ("error" in res) throw new Error(res.error)

  return { id, result: res.data }
}, {
  name: "changeRecipient",
  onFulfill: (ctx, res) => {
    if (!res) return;

    const { id, result } = res;

    cartDataAtom(ctx, (state) => {
      const idx = state.findIndex(target => target.id === id);
      if (idx === -1) return state;

      const item = state[idx]

      return [
        ...state.slice(0, idx),
        { ...item, for: result.toString() },
        ...state.slice(idx + 1)
      ]
    })

    changeRecipientDialogIsOpen(ctx, false)
  },
  onReject: (_, e) => {
    logError(e)
  }
})

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