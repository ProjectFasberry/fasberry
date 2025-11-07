import { client, withJsonBody } from "@/shared/lib/client-wrapper";
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async";
import { action, atom } from "@reatom/core";
import { compareChanges, notifyAboutRestrictRole } from "./actions.model";
import { logError } from "@/shared/lib/log";
import { withAssign, withReset } from "@reatom/framework";
import { withUndo } from '@reatom/undo'
import { alertDialog } from "@/shared/components/config/alert-dialog.model";

export type DictionariesItem = {
  value: string;
  created_at: Date;
  id: number;
  key: string;
}

export const dictionariesListAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(() =>
    client<DictionariesItem[]>("privated/dictionaries/list").exec()
  )
}).pipe(withDataAtom(), withStatusesAtom(), withCache({ swr: false }))

// 
export const dictionariesCreateKeyAtom = atom<string>("", "dictionariesCreateKey").pipe(withReset())
export const dictionariesCreateValueAtom = atom<string>("", "dictionariesCreateValue").pipe(withReset())

export const dictionariesCreate = atom(null, "dictionariesCreate").pipe(
  withAssign((ctx, name) => ({
    resetFull: action((ctx) => {
      dictionariesCreateKeyAtom.reset(ctx)
      dictionariesCreateValueAtom.reset(ctx);
    }, `${name}.resetFull`)
  }))
)

export const dictionariesCreateAction = reatomAsync(async (ctx) => {
  const json = {
    key: ctx.get(dictionariesCreateKeyAtom),
    value: ctx.get(dictionariesCreateValueAtom)
  }

  return await ctx.schedule(() =>
    client
      .post<DictionariesItem>("privated/dictionaries/create")
      .pipe(withJsonBody(json))
      .exec()
  )
}, {
  name: "dictionariesCreateAction",
  onFulfill: (ctx, res) => {
    dictionariesCreate.resetFull(ctx)

    dictionariesListAction.dataAtom(ctx, (state) => state ? [...state, res] : [res]);
  },
  onReject: (ctx, e) => {
    notifyAboutRestrictRole(e)
    logError(e)
  }
}).pipe(withStatusesAtom())

// 
export const dictionariesEditIdAtom = atom<Nullable<number>>(null, "dictionariesEditId").pipe(withReset())
export const dictionariesEditKeyAtom = atom<Nullable<string>>(null, "dictionariesEditKey").pipe(withReset(), withUndo({ length: 200 }))
export const dictionariesEditValueAtom = atom<Nullable<string>>(null, "dictionariesEditValue").pipe(withReset(), withUndo({ length: 200 }))

export const dictionariesEdit = atom(null, "dictionariesEdit").pipe(
  withAssign((ctx, name) => ({
    start: action((ctx, id: number) => {
      const target = ctx.get(dictionariesListAction.dataAtom)?.find(d => d.id === id)
      if (!target) throw new Error("Target is not defined")

      dictionariesEditIdAtom(ctx, target.id);
      dictionariesEditKeyAtom(ctx, target.key)
      dictionariesEditValueAtom(ctx, target.value)
    }, `${name}.start`),
    resetFull: action((ctx) => {
      dictionariesEditIdAtom.reset(ctx)
      dictionariesEditKeyAtom.reset(ctx)
      dictionariesEditValueAtom.reset(ctx);
    }, `${name}.resetFull`),
    getIsEdit: (id: number) => atom(
      (ctx) => ctx.spy(dictionariesEditIdAtom) === id,
      `${name}.getIsEdit`
    ),
    isValid: atom((ctx) => {
      const payload = {
        key: ctx.spy(dictionariesEditKeyAtom),
        value: ctx.spy(dictionariesEditValueAtom)
      }

      const old = {
        key: ctx.get(dictionariesEditKeyAtom.historyAtom)[1],
        value: ctx.get(dictionariesEditValueAtom.historyAtom)[1]
      }

      return compareChanges(payload, old)
    }, `${name}.isValid`),
  }))
)

export const dictionariesEditAction = reatomAsync(async (ctx, id: number) => {
  const json = {
    key: ctx.get(dictionariesEditKeyAtom),
    value: ctx.get(dictionariesEditValueAtom)
  }

  return await ctx.schedule(() =>
    client
      .post<DictionariesItem>(`privated/dictionaries/${id}/edit`)
      .pipe(withJsonBody(json))
      .exec()
  )
}, {
  name: "dictionariesEditAction",
  onFulfill: (ctx, res) => {
    dictionariesEdit.resetFull(ctx)

    dictionariesListAction.dataAtom(ctx,
      (state) => state ? state.filter(s => s.id !== res.id) : []
    )
  },
  onReject: (ctx, e) => {
    notifyAboutRestrictRole(e)
    logError(e)
  }
}).pipe(withStatusesAtom())

// 
const itemToRemoveAtom = atom<{ id: number, title: string } | null>(null, "itemToRemove").pipe(withReset())

export const deleteDictionariesBeforeAction = action((ctx, item: { id: number, title: string }) => {
  itemToRemoveAtom(ctx, item)

  alertDialog.open(ctx, {
    title: `Вы точно хотите удалить "${item.title}"?`,
    confirmAction: action((ctx => dictionariesDeleteAction(ctx, item.id))),
    confirmLabel: "Удалить",
    cancelAction: action((ctx) => itemToRemoveAtom.reset(ctx)),
    autoClose: true
  });
}, "deleteDictionariesBeforeAction")

export const dictionariesDeleteAction = reatomAsync(async (ctx, id: number) => {
  return await ctx.schedule(() =>
    client
      .delete<{ id: number }>(`privated/dictionaries/${id}/remove`)
      .exec()
  )
}, {
  name: "dictionariesCreateAction",
  onFulfill: (ctx, res) => {
    dictionariesListAction.dataAtom(ctx,
      (state) => state ? state.filter(s => s.id !== res.id) : []
    )
  },
  onReject: (ctx, e) => {
    notifyAboutRestrictRole(e)
    logError(e)
  }
}).pipe(withStatusesAtom())