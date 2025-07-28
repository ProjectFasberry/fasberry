import { action, atom, batch, Ctx } from "@reatom/core";
import { isDeepEqual, reatomAsync, sleep, withDataAtom, withInit, withReset, withStatusesAtom } from "@reatom/framework";
import { z } from "zod/v4"
import { Payment, StoreItem } from "./store.model";
import { client } from "@/shared/api/client";
import { toast } from "sonner";
import { withSsr } from "@/shared/lib/ssr";

export type StoreBasket = Pick<StoreItem,
  | "id" | "title" | "description" | "summary" | "price" | "command"
  | "currency" | "type" | "value" | "imageUrl"
> & {
  quantity: number;
  selected: boolean;
  for: string | null;
}

export async function getBasketData(args?: RequestInit) {
  const res = await client("store/basket/list", { throwHttpErrors: false, ...args }).json<WrappedResponse<StoreBasket[]>>();

  if ("error" in res) throw new Error()

  return res.data;
}

export const cartDataAtom = atom<StoreBasket[]>([], "cartData").pipe(withSsr("cartData"))

export const cartDataSelectedAtom = atom((ctx) => {
  return ctx.spy(cartDataAtom).filter(target => target.selected)
}, "cardDataSelected").pipe(
  withInit((ctx) => {
    const data = ctx.get(cartDataAtom)
    return data.filter(target => target.selected)
  })
)

export const cartWarningDialogIsOpenAtom = atom(false, "cartWarningDialogIsOpen")
export const cartWarningDialogDataAtom = atom<{ title: string, description: string } | null>(null, "cartWarningDialogData")
export const cartWarningDialogIsContinueAtom = atom(false, "cartWarningDialogIsContinue")

export const validateBeforeSubmit = action((ctx) => {
  const isContinue = ctx.get(cartWarningDialogIsContinueAtom)

  if (!isContinue) {
    const recipientExists = ctx.get(cartDataSelectedAtom).every(target => typeof target.for === 'string')
  
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
  const lengthValidate = ctx.spy(cartDataSelectedAtom).length >= 1;
  const recipientExists = ctx.spy(cartDataSelectedAtom).filter(target => typeof target.for === 'string').length >= 1

  return lengthValidate && recipientExists
}, "cartIsValidAtom")

export const cartMenuIsOpenAtom = atom(false, "cartMenuIsOpen")

export const updateItemSelectedStatus = reatomAsync(async (ctx, id: number) => {
  const current = ctx.get(cartDataAtom).find(target => target.id === id);
  if (!current) return;

  const json = { id, key: "selected", value: !current.selected }
  const res = await client.post("store/basket/edit", { json }).json<WrappedResponse<boolean>>()

  if ("error" in res) throw new Error(res.error)

  return { id, result: res.data }
}, {
  name: "updateItemSelectedStatus",
  onFulfill: (ctx, res) => {
    if (!res) return;

    const { id, result } = res;

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
        isSelected: item.selected
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
  cartDataAtom(ctx, data)
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

  await ctx.schedule(() => sleep(100))

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
  onReject: (_, e) => e instanceof Error && toast.error(e.message)
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
  onReject: (_, e) => e instanceof Error && toast.error(e.message)
}).pipe(withStatusesAtom())

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
  onReject: (_, e) => e instanceof Error && toast.error(e.message)
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

type CartPrice = {
  REAL: number,
  CHARISM: number,
  BELKOIN: number
}

export const cartPriceAtom = atom<CartPrice>((ctx) => {
  const target = ctx.spy(cartDataSelectedAtom);

  return {
    REAL: target.length === 0 ? 0 : target.reduce((total, item) => total + item.price, 0),
    BELKOIN: 0,
    CHARISM: 0
  }
}, "cartPrice")