import dayjs from "@/shared/lib/create-dayjs";
import { reatomComponent } from "@reatom/npm-react";
import { Typography } from "@repo/ui/typography";
import { IconEye } from "@tabler/icons-react";
import { newsItemAtom } from "@/shared/components/app/news/models/news.model";
import { renderToHTMLString } from '@tiptap/static-renderer'
import type { JSONContent } from "@tiptap/react";
import { onDisconnect } from "@reatom/framework";
import { editorExtensions } from "@/shared/components/config/editor";
import { Avatar } from "@/shared/components/app/avatar/components/avatar";
import { createLink, Link } from "@/shared/components/config/link";

onDisconnect(newsItemAtom, (ctx) => newsItemAtom(ctx, null))

const News = reatomComponent(({ ctx }) => {
  const data = ctx.spy(newsItemAtom);
  if (!data) return null;

  const content = data.content as JSONContent

  if (!content) {
    console.warn("Content is not defined");
    return null;
  }

  const html = renderToHTMLString({ extensions: editorExtensions, content })

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <Typography className="text-3xl font-semibold">
        {data.title}
      </Typography>
      <div className="flex items-center gap-2 w-fit justify-start *:border *:border-neutral-800 *:rounded-lg *:px-4 *:py-1">
        <div className="flex items-center gap-3 w-fit">
          <Typography>
            Создано
          </Typography>
          <Link href={createLink("player", data.creator)} className="flex items-center gap-2">
            <Avatar
              nickname={data.creator}
              propWidth={24}
              propHeight={24}
            />
            <Typography>
              {data.creator}
            </Typography>
          </Link>
        </div>
        <div title={dayjs(data.created_at).format("DD.MM.YYYY")} className="flex items-center">
          <Typography color="gray" className="text-md">
            {dayjs(data.created_at).format('D MMM YYYY')}
          </Typography>
        </div>
        <div className="flex items-center gap-1">
          <Typography color="gray" className="text-md">
            {data.views}
          </Typography>
          <IconEye size={20} />
        </div>
      </div>
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        className="tiptap whitespace-pre-wrap [&>p]:mt-4"
      />
    </div>
  )
}, "NewsItem")

export default function Page() {
  return <News />
}