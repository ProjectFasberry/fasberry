import { reatomAsync, withStatusesAtom } from "@reatom/async";
import { action, atom, batch, Ctx } from "@reatom/core";
import { cartDataAtom, getCartData, cartPriceAtom } from "./store-cart.model";
import { sleep, withInit, withReset } from "@reatom/framework";
import { logError } from "@/shared/lib/log";
import { isAuthAtom } from "@/shared/models/global.model";
import { getRecipient, setRecipientDialogIsOpenAtom, setRecipientValueAtom, storeRecipientAtom } from "./store-recipient.model";
import { currentUserAtom } from "@/shared/models/current-user.model";
import type { StoreItem } from "@repo/shared/types/entities/store"
import { client, withJsonBody, withLogging } from "@/shared/lib/client-wrapper";

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

export async function updateCart(ctx: Ctx) {
  const data = await getCartData()

  batch(ctx, () => {
    cartDataAtom(ctx, data.products)
    cartPriceAtom(ctx, data.price);
  })
}

function simulate(ctx: Ctx, id: number, type: "load" | "select" | "unload" | "unselect") {
  itemStatusesAtom(ctx, (state) => {
    const prev = state?.[id] ?? { isLoading: false, isSelected: false };
    const next = { ...prev };

    switch (type) {
      case "load":
        next.isLoading = true;
        break;
      case "unload":
        next.isLoading = false;
        break;
      case "select":
        next.isSelected = true;
        break;
      case "unselect":
        next.isSelected = false;
        break;
    }

    return {
      ...state,
      [id]: next,
    };
  });
}

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

export const addItemToCartAction = reatomAsync(async (ctx, id: number) => {
  const isAuth = ctx.get(isAuthAtom);

  if (!isAuth) {
    const currentRecipient = ctx.get(setRecipientValueAtom);

    if (!currentRecipient) {
      const globalRecipient = ctx.get(storeRecipientAtom);

      if (!globalRecipient) {
        setRecipientDialogIsOpenAtom(ctx, true);
        return;
      }
    }
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