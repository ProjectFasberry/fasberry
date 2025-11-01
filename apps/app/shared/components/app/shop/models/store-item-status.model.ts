import { atom, Ctx } from "@reatom/core";
import { withInit, withReset } from "@reatom/framework";
import { cartDataAtom } from "./store-cart.model.atoms";

export type SelectItemToCartOptions = {
  isSelected: boolean,
  isLoading: boolean
}

type SelectItemToCartStatus = Record<number, SelectItemToCartOptions>

export const itemStatusesAtom = atom<SelectItemToCartStatus | null>(null, `itemStatuses`).pipe(
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

export function simulate(ctx: Ctx, id: number, type: "load" | "select" | "unload" | "unselect") {
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