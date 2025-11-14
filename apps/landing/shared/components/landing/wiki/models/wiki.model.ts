import { client } from "@/shared/api/client";
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async";
import { atom } from "@reatom/core";
import { navigate } from "vike/client/router";
import type { JSONContent } from "@tiptap/react";

export const wikiParamAtom = atom("general", "param")

wikiParamAtom.onChange((ctx, state) => {
  if (!state) return;

  wikiAction(ctx, state);

  ctx.schedule(() => navigate(`/wiki?tab=${state}`))
})

type Wiki = {
  category: string,
  content: JSONContent,
  updated_at: Date | null
}

type Node = { title: string, value: string }

type RulesCategoriesPayload = {
  [key: string]: { title: string, nodes: Node[] }
}

type RulesCategoriesPayloadExtend = {
  [key: string]: { title: string, isChilded: boolean, nodes: Node[] }
}

type Entries<T> = { [K in keyof T]: [K, T[K]] }[keyof T][];

export const wikiCategoriesAtom = atom<Entries<RulesCategoriesPayloadExtend>>([], "wikiCategories")

export const wikiCategoriesAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(async () => {
    const res = await client("shared/wiki/categories", { signal: ctx.controller.signal })
    const data = await res.json<{ data: RulesCategoriesPayload } | { error: string }>()
    if ('error' in data) throw new Error(data.error)
    return data.data
  })
}, "wikiCategoriesAction").pipe(
  withStatusesAtom(),
  withCache({ swr: false })
)

wikiCategoriesAction.onFulfill.onCall((ctx, res) => {
  const updatedData = Object.fromEntries(
    Object.entries(res).map(([key, val]) => [
      key,
      {
        ...val,
        isChilded: val.nodes.length > 0 && val.nodes[0].value !== key
      }
    ])
  );

  const result = Object.entries(updatedData)

  wikiCategoriesAtom(ctx, result)
})

export const wikiAction = reatomAsync(async (ctx, category: string) => {
  return await ctx.schedule(async () => {
    const res = await client(`shared/wiki/category/${category}`, { signal: ctx.controller.signal })
    const data = await res.json<{ data: Wiki } | { error: string }>()
    if ("error" in data) throw new Error(data.error)
    return data.data
  })
}, "wikiAction").pipe(withStatusesAtom(), withDataAtom(), withCache({ swr: false }))

export const wikiCategoriesNodesAtom = atom((ctx) => {
  const target = ctx.spy(wikiCategoriesAtom)
  if (!target) return []
  const allNodes = target.flatMap(([_, group]) => group.nodes);
  return allNodes
}, "wikiCategoriesNodes")
