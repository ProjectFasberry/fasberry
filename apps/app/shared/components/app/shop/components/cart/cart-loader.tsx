import { reatomComponent, useUpdate } from "@reatom/npm-react";
import { Typography } from "@repo/ui/typography";
import { createOrderAction } from "../../models/store.model";

export const CartLoader = reatomComponent(({ ctx }) => {
  const isLoading = ctx.spy(createOrderAction.statusesAtom).isPending;

  useUpdate((ctx) => {
    document.body.style.overflow = isLoading ? "hidden" : ""
  }, [isLoading])

  if (!isLoading) return null;

  return (
    <div className="flex flex-col gap-4 fixed bg-black/60 z-[100] items-center justify-center h-full w-full">
      <div className="ui-loader loader-blk">
        <svg viewBox="22 22 44 44" className="multiColor-loader">
          <circle cx="44" cy="44" r="20.2" fill="none" strokeWidth="3.6" className="loader-circle loader-circle-animation">
          </circle>
        </svg>
      </div>
      <Typography className="font-semibold text-xl">
        Готовим заказ
      </Typography>
    </div>
  )
}, "CartLoader")