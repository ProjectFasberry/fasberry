import { reatomComponent, useUpdate } from '@reatom/npm-react';
import { Link } from '@/shared/components/config/Link';
import { Dialog, Portal } from '@ark-ui/react';
import { Typography } from '@/shared/ui/typography';
import { News as NewsType, newsAction, newsDataAtom, newsDialogIsOpen, openNewsDialog, selectedNews } from './news.model';
import { NewsListSkeleton, NewsNotFound } from './news-page-list';
import { dayjs } from '@/shared/lib/create-dayjs';

// todo: migrate to resource
const FetchNews = () => {
  useUpdate((ctx) => newsAction(ctx, { limit: 4, ascending: true }), [])
  return null;
}

const SelectedNewsDialog = reatomComponent(({ ctx }) => {
  const selected = ctx.spy(selectedNews)
  if (!selected) return;

  const { title, created_at, imageUrl, description } = selected

  const formattedCreatedAt = dayjs(created_at).format('DD.MM.YYYY HH:mm')

  return (
    <Dialog.Root open={ctx.spy(newsDialogIsOpen)} onOpenChange={v => newsDialogIsOpen(ctx, v.open)}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content className="flex flex-col xl:flex-row rounded-lg p-0 gap-x-6">
            <div className="max-h-[200px] lg:max-h-[420px] w-full overflow-hidden">
              <img
                width={1920} height={1080} src={imageUrl} alt="" className="max-h-[220px] lg:max-h-[420px] object-cover w-full h-full"
              />
            </div>
            <div className="flex flex-col justify-between gap-6 w-full xl:w-3/4 p-2 md:py-4 md:pl-2 md:pr-6">
              <div className="flex flex-col gap-y-4">
                <Typography color="white" className="text-xl lg:text-3xl">
                  {title}
                </Typography>
                <Typography color="white" className="text-md lg:text-xl">
                  {description}
                </Typography>
              </div>
              <Typography color="gray" className="text-sm self-end lg:text-base">
                {formattedCreatedAt}
              </Typography>
            </div>
            <Dialog.CloseTrigger>Close</Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}, "SelectedNews")

const NewsItem = reatomComponent<NewsType>(({ ctx, imageUrl, title, created_at, description, id }) => {
  return (
    <div className="flex flex-col w-full h-full bg-neutral-950 overflow-hidden rounded-xl">
      <div
        onClick={() => openNewsDialog(ctx, { created_at, title, description, id, imageUrl })}
        className="h-[200px] lg:h-[444px] cursor-pointer w-full"
      >
        <img width={1920} height={1080} src={imageUrl} alt="" className="object-cover w-full h-full" />
      </div>
      <div
        className="flex lg:flex-row flex-col justify-between items-start lg:items-center overflow-hidden p-4 lg:p-6 w-full gap-y-4"
      >
        <div className="block whitespace-normal w-3/4 overflow-hidden truncate">
          <Typography color="white" className="text-left text-xl">{title}</Typography>
        </div>
        <div className="w-full lg:w-1/4 flex justify-end">
          <p className="text-neutral-400 text-lg">
            {dayjs(created_at).format('DD.MM.YYYY HH:mm')}
          </p>
        </div>
      </div>
    </div>
  )
}, "NewsItem")

export const NewsList = reatomComponent(({ ctx }) => {
  const news = ctx.spy(newsDataAtom)

  if (ctx.spy(newsAction.statusesAtom).isPending) return <NewsListSkeleton />

  if (!news) return <NewsNotFound />

  return (
    <div className="flex flex-col gap-6">
      {news && (
        <>
          <SelectedNewsDialog />
          {news.map((item, idx) => (
            <NewsItem key={idx} {...item} />
          ))}
          {news.length > 3 && (
            <Link href="/news">
              <Typography color="gray" className="font-bold text-2xl">Показать больше</Typography>
            </Link>
          )}
        </>
      )}
    </div>
  );
}, "NewsList")

export const News = () => {
  return (
    <>
      <FetchNews />
      <NewsList />
    </>
  )
}