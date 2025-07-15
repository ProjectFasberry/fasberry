import { reatomComponent } from "@reatom/npm-react";
import { Typography } from "@repo/ui/typography";
import { Checkbox } from "@repo/ui/checkbox"
import { AtomState, Ctx } from "@reatom/core";
import { storeCategoryAtom, storeWalletFilterAtom } from "../../models/store.model";

const FILTERS = [
  {
    title: "Тип товара",
    origin: "category",
    atom: storeCategoryAtom,
    updater: (ctx: Ctx, value: string) => 
      storeCategoryAtom(ctx, value as AtomState<typeof storeCategoryAtom>),
    filters: [
      { name: "Все", value: "all" },
      { name: "Привилегии", value: "donate", },
      { name: "Ивенты", value: "events" },
    ]
  },
  {
    title: "Валюта",
    origin: "wallet",
    atom: storeWalletFilterAtom,
    updater: (ctx: Ctx, value: string) => 
      storeWalletFilterAtom(ctx, value as AtomState<typeof storeWalletFilterAtom>),
    filters: [
      { name: "Все", value: "all" },
      { name: "Игровая", value: "game", },
      { name: "Реальная", value: "real" },
    ]
  }
]

export const StoreFilters = reatomComponent(({ ctx }) => {
  const handle = (
    updater: (ctx: Ctx, value: string) => void,
    isChecked: string | boolean,
    target: string
  ) => {
    if (typeof isChecked !== 'boolean') return;

    updater(ctx, isChecked ? target : "all");
  }

  const getUniqueFilterId = (v1: string, v2: string) => `${v1}${v2}`

  return (
    FILTERS.map((item) => (
      <div key={item.origin} className="flex flex-col gap-2">
        <Typography color="gray" className="text-lg">
          {item.title}
        </Typography>
        <div className='flex flex-col gap-2 w-full'>
          {item.filters.map((filter, idx) => (
            <label
              key={idx}
              htmlFor={getUniqueFilterId(item.origin, filter.value)}
              className="flex items-center gap-2 bg-neutral-800 rounded-md p-2"
            >
              <Checkbox
                id={getUniqueFilterId(item.origin, filter.value)}
                checked={ctx.spy(item.atom) === filter.value}
                onCheckedChange={e => handle(item.updater, e, filter.value)}
              />
              <Typography color="white" className="text-base">
                {filter.name}
              </Typography>
            </label>
          ))}
        </div>
      </div>
    ))
  )
}, "StoreFilters")