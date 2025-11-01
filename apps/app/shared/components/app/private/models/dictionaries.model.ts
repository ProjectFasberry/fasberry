import { client, withJsonBody } from "@/shared/lib/client-wrapper";
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async";
import { atom } from "@reatom/core";
import { notifyAboutRestrictRole } from "./actions.model";
import { logError } from "@/shared/lib/log";
import { withReset } from "@reatom/framework";

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

export const dictionariesEditKeyAtom = atom<Nullable<string>>(null).pipe(withReset())
export const dictionariesEditValueAtom = atom<Nullable<string>>(null).pipe(withReset())

export const dictionariesCreateAction = reatomAsync(async (ctx) => {
  const json = {
    key: ctx.get(dictionariesEditKeyAtom),
    value: ctx.get(dictionariesEditValueAtom)
  }

  return await ctx.schedule(() =>
    client.post<DictionariesItem>("privated/dictionaries/create").pipe(withJsonBody(json)).exec()
  )
}, {
  name: "dictionariesCreateAction",
  onFulfill: (ctx, res) => {
    dictionariesEditKeyAtom.reset(ctx)
    dictionariesEditValueAtom.reset(ctx);

    dictionariesListAction.dataAtom(ctx, (state) => state ? [...state, res] : [res]);
  },
  onReject: (ctx, e) => {
    notifyAboutRestrictRole(e)
    logError(e)
  }
}).pipe(withStatusesAtom())

export const dictionariesDeleteAction = reatomAsync(async (ctx, id: number) => {
  return await ctx.schedule(() =>
    client.delete<{ id: number }>(`privated/dictionaries/${id}/remove`).exec()
  )
}, {
  name: "dictionariesCreateAction",
  onFulfill: (ctx, res) => {
    dictionariesListAction.dataAtom(ctx, (state) => state ? state.filter(s => s.id !== res.id) : [])
  },
  onReject: (ctx, e) => {
    notifyAboutRestrictRole(e)
    logError(e)
  }
}).pipe(withStatusesAtom())

export const dictionariesEditAction = reatomAsync(async (ctx, id: number) => {
  const json = {
    key: ctx.get(dictionariesEditKeyAtom),
    value: ctx.get(dictionariesEditValueAtom)
  }

  return await ctx.schedule(() =>
    client.post<DictionariesItem>(`privated/dictionaries/${id}/edit`).pipe(withJsonBody(json)).exec()
  )
}, {
  name: "dictionariesEditAction",
  onFulfill: (ctx, res) => {
    dictionariesEditKeyAtom.reset(ctx)
    dictionariesEditValueAtom.reset(ctx);

    dictionariesListAction.dataAtom(ctx, (state) => state ? state.filter(s => s.id !== res.id) : [])
  },
  onReject: (ctx, e) => {
    notifyAboutRestrictRole(e)
    logError(e)
  }
}).pipe(withStatusesAtom())