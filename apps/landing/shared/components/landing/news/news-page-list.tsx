import { reatomComponent } from '@reatom/npm-react';
import { Skeleton } from '@repo/ui/skeleton';
import { Typography } from '@repo/ui/typography';
import { dayjs } from '@/shared/lib/create-dayjs';
import { News, newsAction, newsDataAtom, newsFilterAtom, updateNewsAction } from './news.model';
import { Dialog, DialogContent, DialogTrigger } from '@repo/ui/dialog';

const NewsPageItem = ({
  imageUrl, created_at, description, title
}: News) => {
  return (
    <Dialog>
      <DialogTrigger
        className="flex flex-col group overflow-hidden h-[320px] relative border-2 border-neutral-600 rounded-xl"
      >
        <img
          src={imageUrl}
          alt=""
          width={1920}
          height={1080}
          draggable={false}
          className="rounded-xl relative w-full h-full object-cover"
          loading="lazy"
        />
        <div
          className="flex rounded-t-xl ease-out duration-300 
            flex-col absolute bg-gradient-to-t from-black via-black/80 to-transparent bottom-0 overflow-hidden p-3 w-full"
        >
          <div
            className="flex flex-col items-start group-hover:-translate-y-0 translate-y-14
              text-left duration-300 ease-out w-full"
          >
            <Typography className="text-xl text-white text-left">
              {title.length > 34 ? title.slice(0, 34) + "..." : title}
            </Typography>
            <Typography
              color="gray"
              className="text-left group-hover:opacity-0 group-hover:overflow-hidden group-hover:absolute duration-300 opacity-100 text-lg"
            >
              {dayjs(created_at).format('D MMM YYYY')}
            </Typography>
          </div>
          <Typography
            color="gray"
            className="text-left group-hover:-translate-y-0 translate-y-24
              duration-300 ease-out text-lg"
          >
            {description.length > 38 ? description.slice(0, 36) + "..." : description}
          </Typography>
        </div>
      </DialogTrigger>
      <DialogContent className="flex lg:flex-row flex-col items-start gap-4">
        <div className="flex flex-col w-full lg:w-2/3 gap-y-4">
          <div className="flex flex-col">
            <Typography className="text-white text-xl text-left">
              {title}
            </Typography>
            <Typography color="gray" className="text-left text-lg">
              {dayjs(created_at).format('D MMM YYYY')}
            </Typography>
          </div>
          <Typography className="text-white text-left text-lg">
            {description}
          </Typography>
        </div>
        <div className="flex w-full lg:w-1/3 lg:h-1/2">
          <img
            src={imageUrl}
            alt=""
            width={1920}
            height={1080}
            draggable={false}
            className="rounded-xl relative w-full h-full object-cover"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const NewsListSkeleton = () => {
  return (
    <>
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-64 w-full" />
    </>
  )
}

export const NewsNotFound = () => {
  return (
    <Typography color="gray" className="text-xl">
      Не нашлось новостей :/
    </Typography>
  )
}

export const NewsPageList = reatomComponent(({ ctx }) => {
  const searchQuery = ctx.spy(newsFilterAtom).search
  const news = ctx.spy(newsDataAtom)

  if (ctx.spy(updateNewsAction.statusesAtom).isPending || ctx.spy(newsAction.statusesAtom).isPending) {
    return <NewsListSkeleton />
  }

  if (ctx.spy(newsAction.statusesAtom).isRejected || !news) {
    return <NewsNotFound/>
  }
  
  if (!news.length && searchQuery) {
    return (
      <Typography color="gray" className="text-2xl">
        Не нашлось ничего по вашему запросу <span className="text-white">{`"${searchQuery}"`}</span>
      </Typography>
    )
  }

  return news.map(newsItem => <NewsPageItem key={newsItem.id} {...newsItem} />)
}, "NewsPageList")