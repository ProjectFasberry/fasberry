import { reatomComponent } from "@reatom/npm-react";
import { Typography } from "@repo/ui/typography";
import { Checkbox } from "@repo/ui/checkbox"
import { AtomState, Ctx } from "@reatom/core";
import { storeCategoryAtom, storeWalletFilterAtom } from "../../models/store.model";
import { IconFilter } from "@tabler/icons-react";
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "@repo/ui/sheet"

const FILTERS = [
  {
    title: "Тип товара",
    origin: "category",
    atom: storeCategoryAtom,
    updater: (ctx: Ctx, value: string) => storeCategoryAtom(ctx, value as AtomState<typeof storeCategoryAtom>),
    filters: [
      { name: "Все", value: "all" },
      { name: "Привилегии", value: "donate", },
      { name: "Ивенты", value: "event" },
    ]
  },
  {
    title: "Валюта",
    origin: "wallet",
    atom: storeWalletFilterAtom,
    updater: (ctx: Ctx, value: string) =>
      storeWalletFilterAtom(ctx, value as AtomState<typeof storeWalletFilterAtom>),
    filters: [
      { name: "Все", value: "ALL", },
      { name: "Харизма", value: "CHARISM" },
      { name: "Белкоин", value: "BELKOIN", }
    ]
  }
]

const StoreFilterList = reatomComponent(({ ctx }) => {
  const handle = (
    updater: (ctx: Ctx, value: string) => void,
    isChecked: string | boolean,
    target: string
  ) => {
    if (typeof isChecked !== 'boolean') return;

    updater(ctx, isChecked ? target : "ALL");
  }

  const getUniqueFilterId = (v1: string, v2: string) => `${v1}${v2}`

  return (
    <>
      {FILTERS.map((item) => (
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
      ))}
    </>
  )
}, "StoreFilterList")

const StoreFiltersSheet = reatomComponent(({ctx}) => {
  return (
    <Sheet>
      <SheetTrigger className="flex w-full cursor-pointer gap-2 items-center justify-center">
        <IconFilter size={24} className="text-neutral-400" />
        <Typography color="gray" className="text-lg font-semibold">
          Изменить фильтры
        </Typography>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className='flex flex-col items-center justify-start max-h-[60vh] overflow-y-auto gap-4 rounded-t-2xl'
      >
        <SheetTitle>Фильтры</SheetTitle>
        <div className='flex flex-col gap-2 w-full'>
          <StoreFilterList />
        </div>
      </SheetContent>
    </Sheet>
  )
}, "StoreFiltersSheet")

export const StoreFilters = () => {
  return (
    <div className="flex sm:flex-col justify-center gap-y-6 gap-x-2 w-full h-fit">
      <div className="sm:hidden block">
        <StoreFiltersSheet/>
      </div>
      <div className="hidden sm:block">
        <StoreFilterList />
      </div>
    </div>
  )
}