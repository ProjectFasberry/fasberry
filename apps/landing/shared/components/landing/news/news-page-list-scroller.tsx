import { useInView } from "react-intersection-observer";
import { useUpdate } from "@reatom/npm-react";
import { newsMetaAtom, updateNewsAction } from "./news.model";
import { atom } from "@reatom/core";

const inViewAtom = atom(false, "inView")

inViewAtom.onChange((ctx, state) => {
  if (!state) return;

  const hasNextPage = ctx.get(newsMetaAtom)?.hasNextPage
  if (!hasNextPage) return;

  const cursor = ctx.get(newsMetaAtom)?.endCursor
  updateNewsAction(ctx, { cursor })
})

export const NewsPageListInView = () => {
  const { ref, inView } = useInView({ threshold: 1 })
  useUpdate((ctx) => inViewAtom(ctx, inView), [inView])
  return <div ref={ref} className="h-[1px] w-full border" />
}