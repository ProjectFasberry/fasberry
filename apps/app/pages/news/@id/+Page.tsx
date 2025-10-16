import dayjs from "@/shared/lib/create-dayjs";
import { reatomComponent } from "@reatom/npm-react";
import { Typography } from "@repo/ui/typography";
import { MainWrapperPage } from "@/shared/components/config/wrapper";
import { IconEye } from "@tabler/icons-react";
import { newsItemAtom } from "@/shared/components/app/news/models/news.model";

const NewsItem = reatomComponent(({ ctx }) => {
  const data = ctx.spy(newsItemAtom);
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

export default function Page() {
  return (
    <MainWrapperPage>
      <NewsItem />
    </MainWrapperPage>
  )
}