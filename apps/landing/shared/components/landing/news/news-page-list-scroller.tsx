import { useInView } from "react-intersection-observer";
import { useUpdate } from "@reatom/npm-react";
import { newsFilterAtom, updateNewsAction } from "./news.model";

const Sync = ({ inView }: { inView: boolean }) => {
  useUpdate((ctx) => {
    if (!inView) return;

    const hasNextPage = ctx.get(newsFilterAtom)?.hasNextPage

    if (hasNextPage) {
      const cursor = ctx.get(newsFilterAtom).cursor

      updateNewsAction(ctx, { cursor })
    }
  }, [])

  return null
}

export const NewsPageListInView = () => {
  const { ref, inView } = useInView({ threshold: 1 })

  return (
    <>
      <Sync inView={inView} />
      <div ref={ref} className="h-[1px] w-full border" />
    </>
  )
}