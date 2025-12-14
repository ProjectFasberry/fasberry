import { reatomComponent, useUpdate } from "@reatom/npm-react";
import { Typography } from "@repo/ui/typography";
import { Data } from "./+data";
import { ItemPrice, ItemSelectToCart } from "@/shared/components/app/shop/components/items/store-list";
import { atom } from "@reatom/core";
import { useData } from "vike-react/useData"
import { renderToHTMLString } from "@tiptap/static-renderer";
import { editorExtensions } from "@/shared/components/config/editor";
import type { JSONContent } from "@tiptap/react";
import { StoreItem } from "@repo/shared/types/entities/store";

const selectedItemAtom = atom<StoreItem | null>(null, "selectedItem")

const SelectedDonate = reatomComponent(({ ctx }) => {
  const data = ctx.spy(selectedItemAtom)
  if (!data) return null;

  const html = renderToHTMLString({ 
    extensions: editorExtensions, 
    content: data.content as JSONContent 
  })

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
}, "SelectedDonate")

export default function Page() {
  const { data } = useData<Data>();

  useUpdate((ctx) => selectedItemAtom(ctx, data), [data]);

  return <SelectedDonate />
}