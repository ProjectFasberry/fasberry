import { pageContextAtom } from "@/shared/models/global.model";
import { Data } from "./+data";
import { action } from "@reatom/core";
import { reatomComponent, useUpdate } from "@reatom/npm-react";
import { Typography } from "@repo/ui/typography";
import { MainWrapperPage } from "@/shared/components/config/wrapper";
import { IconEye } from "@tabler/icons-react";
import dayjs from "dayjs";
import { startPageEvents } from "@/shared/lib/events";
import { useData } from "vike-react/useData";

const events = action((ctx) => {
  const pageContext = ctx.get(pageContextAtom);
  if (!pageContext) return;

  // const data = pageContext.data as Data
}, "events")

const NewsItem = reatomComponent(({ ctx }) => {
  const data = useData<Data>().news
  if (!data) return null;

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <Typography className="text-xl font-semibold">
        {data.title}
      </Typography>
      <Typography className="text-lg">
        {data.description}
      </Typography>
      <div className="flex justify-between items-center w-full">
        <Typography color="gray" className="text-md">
          {dayjs(data.created_at).format('D MMM YYYY')}
        </Typography>
        <div className="flex items-center gap-1">
          <Typography color="gray" className="text-md">
            {data.views}
          </Typography>
          <IconEye size={20} />
        </div>
      </div>
    </div>
  )
}, "NewsItem")

export default function NewsPage() {
  useUpdate((ctx) => startPageEvents(ctx, events, { urlTarget: "news" }), [pageContextAtom]);

  return (
    <MainWrapperPage>
      <NewsItem />
    </MainWrapperPage>
  )
}