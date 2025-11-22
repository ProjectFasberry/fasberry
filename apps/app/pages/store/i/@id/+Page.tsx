import { useUpdate } from "@reatom/npm-react";
import { Typography } from "@repo/ui/typography";
import { Data } from "./+data";
import { ItemPrice, ItemSelectToCart } from "@/shared/components/app/shop/components/items/store-list";
import { action } from "@reatom/core";
import { pageContextAtom } from "@/shared/models/page-context.model";
import { startPageEvents } from "@/shared/lib/events";
import { useData } from "vike-react/useData"
import { renderToHTMLString } from "@tiptap/static-renderer";
import { editorExtensions } from "@/shared/components/config/editor";
import type { JSONContent } from "@tiptap/react";

const events = action((ctx) => {
  const pageContext = ctx.get(pageContextAtom);
  if (!pageContext) return;
}, "events")

const SelectedDonate = () => {
  const data = useData<Data>().data
  const html = renderToHTMLString({ extensions: editorExtensions, content: data.content as JSONContent })

  return (
    <div className="flex flex-col sm:flex-row items-start gap-8 w-full justify-center h-full">
      <div className="flex w-full items-center justify-center sm:w-1/4 bg-neutral-800/40 p-4 rounded-3xl">
        <img src={data.imageUrl} width={256} draggable={false} height={256} alt={data.title} />
      </div>
      <div className="flex flex-col gap-4 w-full sm:w-3/4 h-full">
        <div id="header" className="flex flex-col w-full gap-1">
          <Typography className="text-lg font-semibold md:text-xl lg:text-2xl">
            {data.title}
          </Typography>
          <Typography color="gray" className="text-sm md:text-base">
            {data.description}
          </Typography>
        </div>
        <div
          id="content"
          dangerouslySetInnerHTML={{ __html: html }}
          className="tiptap whitespace-pre-wrap p-0!"
        />
        <div
          id="purchase"
          className="flex items-center border border-neutral-800 px-4 py-2 rounded-xl gap-6 justify-between w-full sm:w-fit"
        >
          <ItemPrice currency={data.currency} price={data.price} />
          <div>
            <ItemSelectToCart id={data.id} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  useUpdate((ctx) => startPageEvents(ctx, events, { urlTarget: "i" }), [pageContextAtom]);

  return (
    <SelectedDonate />
  )
}
