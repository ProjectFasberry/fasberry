import { logError } from "@/shared/lib/log";
import { action, atom, AtomState, CtxSpy } from "@reatom/core";
import { reatomAsync, reatomRecord, sleep, withCache, withDataAtom, withReset, withStatusesAtom } from "@reatom/framework";
import { DEFAULT_SOFT_TIMEOUT, getStoreItems, StoreItemsParams } from "../../shop/models/store.model";
import { StoreItemsPayload } from "@repo/shared/types/entities/store";
import { client, withJsonBody } from "@/shared/lib/client-wrapper";
import { toast } from "sonner";
import { alertDialogIsOpenAtom, openAlertDialogAction } from "@/shared/components/config/alert-dialog";

export const createStoreItemTitleAtom = atom("", "createStoreItemTitle");
export const createStoreItemDescriptionAtom = atom<string | null>(null, "createStoreItemDescription");
export const createStoreItemSummaryAtom = atom<string | null>(null, "createStoreItemSummary");
export const createStoreItemImageUrlAtom = atom<string | null>(null, "createStoreItemImageUrl");
export const createStoreItemCurrencyAtom = atom<string | null>(null, "createStoreItemCurrencyAtom");
export const createStoreItemValueAtom = atom<number | null>(0, "createStoreItemValue");

type StoreItem = StoreItemsPayload["data"][number]

type FieldSchema = {
  type: "input"
  value: (ctx: CtxSpy) => string
  onChange: (ctx: CtxSpy, e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
}

export const createStoreItemFormSchema: FieldSchema[] = [
  {
    type: "input",
    value: ctx => ctx.spy(createStoreItemTitleAtom),
    onChange: (ctx, e) => createStoreItemTitleAtom(ctx, e.target.value),
    placeholder: "Заголовок",
  },
  {
    type: "input",
    value: ctx => ctx.spy(createStoreItemDescriptionAtom) ?? "",
    onChange: (ctx, e) => createStoreItemDescriptionAtom(ctx, e.target.value),
    placeholder: "Описание",
  },
  {
    type: "input",
    value: ctx => ctx.spy(createStoreItemSummaryAtom) ?? "",
    onChange: (ctx, e) => createStoreItemSummaryAtom(ctx, e.target.value),
    placeholder: "Саммери",
  },
  {
    type: "input",
    value: ctx => ctx.spy(createStoreItemCurrencyAtom) ?? "",
    onChange: (ctx, e) => createStoreItemCurrencyAtom(ctx, e.target.value),
    placeholder: "Валюта",
  },
]

export const createStoreItemAction = reatomAsync(async (ctx) => {
  const body = {
    title: ctx.get(createStoreItemTitleAtom),
    summary: ctx.get(createStoreItemSummaryAtom),
    imageUrl: ctx.get(createStoreItemImageUrlAtom),
    value: ctx.get(createStoreItemValueAtom),
    currency: ctx.get(createStoreItemCurrencyAtom),
    description: ctx.get(createStoreItemDescriptionAtom)
  }

  return await ctx.schedule(() =>
    client
      .post<StoreItem>("privated/store/item/create")
      .pipe(withJsonBody(body))
      .exec()
  )
}, {
  name: "createStoreItemAction",
  onFulfill: (ctx, res) => {

  },
  onReject: (_, e) => {
    logError(e, { type: "combined" })
  }
}).pipe(withStatusesAtom())

export const removeStoreItemAtom = atom<StoreItem | null>(null).pipe(withReset())

export const removeStoreItemBeforeAction = action((ctx, item: StoreItem) => {
  openAlertDialogAction(ctx, {
    title: `Вы точно хотите удалить товар "${item.title}"?`,
    description: "Товар будет удален безвозвратно",
    action: action((ctx => removeStoreItemAction(ctx, item.id))),
    actionTitle: "Удалить",
    rollbackAction: action((ctx) => {
      removeStoreItemAtom.reset(ctx)
    })
  });

  removeStoreItemAtom(ctx, item)
}, "removeStoreItemBeforeAction")

export const removeStoreItemAction = reatomAsync(async (ctx, id: number) => {
  await ctx.schedule(() => sleep(DEFAULT_SOFT_TIMEOUT))

  return await ctx.schedule(() => client.delete<{ id: number }>(`privated/store/item/${id}`).exec())
}, {
  name: "removeStoreItemAction",
  onFulfill: (ctx, res) => {
    toast.success("Товар удален");

    storeItemsAction.cacheAtom.reset(ctx);

    storeItemsAction.dataAtom(ctx, (state) => {
      return state ? { data: state.data.filter(d => d.id !== res.id), meta: state.meta } : undefined
    })

    alertDialogIsOpenAtom.reset(ctx)
  },
  onReject: (ctx, e) => {
    logError(e, { type: "combined" })
  }
}).pipe(withStatusesAtom())

export const editItemAtom = atom<StoreItemsPayload["data"][number] | null>(null, "editItem")

export const editStoreItemAction = reatomAsync(async (ctx, id: number) => {
  await ctx.schedule(() => sleep(DEFAULT_SOFT_TIMEOUT))

  return await ctx.schedule(() => client.post(`privated/store/item/edit/${id}`).exec())
}, {
  name: "editStoreItemAction",
  onFulfill: (ctx, res) => {

  },
  onReject: (ctx, e) => {
    logError(e, { type: "combined" })
  }
}).pipe(withStatusesAtom())

export const storeCategoryAtom = atom<StoreItemsParams["type"]>("all");
export const storeWalletFilterAtom = atom<StoreItemsParams["wallet"]>("ALL");

export const storeItemsAction = reatomAsync(async (ctx) => {
  await ctx.schedule(() => sleep(DEFAULT_SOFT_TIMEOUT))

  const params: StoreItemsParams = {
    type: ctx.get(storeCategoryAtom),
    wallet: ctx.get(storeWalletFilterAtom)
  }

  return await ctx.schedule(() => getStoreItems(params))
}, {
  name: "storeItemsAction",
  onFulfill: (ctx, res) => {

  },
  onReject: (ctx, e) => {
    logError(e, { type: "combined" })
  }
}).pipe(withDataAtom(), withStatusesAtom(), withCache({ swr: false }))

export const searchParamsAtom = reatomRecord<Record<string, string>>({}, "searchParams")
export const searchParamTargetAtom = atom<"create" | "edit" | "view">("view", "searchParamTarget")

searchParamsAtom.onChange(async (ctx, state) => {
  const target = state["target"] as AtomState<typeof searchParamTargetAtom> | undefined;
  searchParamTargetAtom(ctx, target ?? "view");

  if (target === 'edit') {
    const data = ctx.get(storeItemsAction.dataAtom)?.data;
    const id = state["id"];

    let item: StoreItemsPayload["data"][number] | null = null;

    if (!data) {
      const requestedData = await storeItemsAction(ctx);
      const requestedItem = requestedData.data.find(d => d.id === Number(id))

      if (requestedItem) {
        item = requestedItem
      }
    } else {
      const currentItem = data.find((d) => d.id === Number(id))

      if (currentItem) {
        item = currentItem
      }
    }

    if (!item) {
      throw new Error('Товар не найден')
    }

    editItemAtom(ctx, item)
  }
})