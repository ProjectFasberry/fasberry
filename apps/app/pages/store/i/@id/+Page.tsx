import { MainWrapperPage } from "@/shared/components/config/wrapper";
import { reatomComponent, useUpdate } from "@reatom/npm-react";
import { Typography } from "@repo/ui/typography";
import { Data } from "./+data";
import { ItemPrice, ItemSelectToCart } from "@/shared/components/app/shop/components/items/store-list";
import { action } from "@reatom/core";
import { pageContextAtom } from "@/shared/models/global.model";
import { startPageEvents } from "@/shared/lib/events";
import { useData } from "vike-react/useData"
import { SetRecipientDialog } from "@/shared/components/app/shop/components/recipient/set-recipient";

const events = action((ctx) => {
  const pageContext = ctx.get(pageContextAtom);
  if (!pageContext) return;

  // const data = pageContext.data as Data;
  // 
}, "events")

const SelectedDonate = reatomComponent(({ ctx }) => {
  const data = useData<Data>().data

  const desc = data.description ? data.description as [] : []

  return (
    <div className="flex flex-col sm:flex-row items-start gap-8 w-full justify-center h-full">
      <div className="flex w-full items-center justify-center sm:w-1/4 bg-neutral-800/40 p-4 rounded-3xl">
        <img src={data.imageUrl} width={256} height={256} alt={data.title} />
      </div>
      <div className="flex flex-col gap-4 w-full sm:w-3/4 h-full">
        <div className="flex flex-col w-full ">
          <Typography className="text-lg font-semibold md:text-xl lg:text-2xl">
            {data.title}
          </Typography>
          <Typography color="gray" className="text-sm md:text-base lg:text-lg">
            {data.summary}
          </Typography>
        </div>
        {(desc && (desc.length >= 1 && typeof desc[0] === 'string')) && (
          <div className="flex flex-col w-full gap-4 items-center overflow-auto max-h-[260px] justify-start rounded-xl">
            <div className="flex flex-col w-full">
              <Typography className="text-xl font-semibold">
                Возможности
              </Typography>
              <div className="flex flex-col w-full">
                {desc.map((feature, idx) => (
                  <Typography key={idx} className="text-base">
                    {`-`} {feature}
                  </Typography>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col items-start gap-4 w-fit">
          <ItemPrice currency={data.currency} price={data.price} />
          <ItemSelectToCart id={data.id} />
        </div>
      </div>
    </div>
  )
}, "SelectedDonate")

export default function Page() {
  useUpdate((ctx) => startPageEvents(ctx, events, { urlTarget: "i" }), [pageContextAtom]);

  return (
    <MainWrapperPage>
      <SelectedDonate />
      <SetRecipientDialog />
    </MainWrapperPage>
  )
}