import { Typography } from "@repo/ui/typography"
import { reatomComponent } from "@reatom/npm-react"
import { Input } from "@repo/ui/input"
import { Button } from "@repo/ui/button"
import {
  bannerDescriptionAtom,
  bannerHrefTitleAtom,
  bannerHrefValueAtom,
  bannersAction,
  bannerTitleAtom,
  createBannerAction,
  createEventAction,
  createNewsAction,
  deleteBannerAction,
  deleteNewsAction,
  eventDescriptionAtom,
  eventInitiatorAtom,
  eventTitleAtom,
  eventTypeAtom,
  newsDescriptionAtom,
  newsImageAtom,
  newsTitleAtom
} from "../models/actions.model"
import { IconX } from "@tabler/icons-react"
import { newsAction, newsDataAtom } from "../../news/models/news.model"
import { Skeleton } from "@repo/ui/skeleton"

export const CreateEvent = reatomComponent(({ ctx }) => {
  return (
    <div className="flex flex-col gap-2 w-full h-full">
      <Input
        value={ctx.spy(eventTypeAtom)}
        onChange={e => eventTypeAtom(ctx, e.target.value)}
        placeholder="Тип"
      />
      <Input
        value={ctx.spy(eventTitleAtom)}
        onChange={e => eventTitleAtom(ctx, e.target.value)}
        placeholder="Заголовок"
      />
      <Input
        value={ctx.spy(eventDescriptionAtom)}
        onChange={e => eventDescriptionAtom(ctx, e.target.value)}
        placeholder="Описание"
      />
      <Input
        value={ctx.spy(eventInitiatorAtom)}
        onChange={e => eventInitiatorAtom(ctx, e.target.value)}
        placeholder="Инициатор"
      />
      <Button
        onClick={() => createEventAction(ctx)}
        disabled={ctx.spy(createEventAction.statusesAtom).isPending}
        className="self-end px-4 rounded-lg font-semibold text-lg bg-neutral-50 text-neutral-950"
      >
        Создать
      </Button>
    </div>
  )
}, "CreateEvent")

export const DeleteBanner = reatomComponent<{ id: number }>(({ ctx, id }) => {
  return (
    <Button
      onClick={() => deleteBannerAction(ctx, id)}
      disabled={ctx.spy(deleteBannerAction.statusesAtom).isPending}
      className="bg-neutral-900 aspect-square"
    >
      <IconX size={18} />
    </Button>
  )
}, "DeleteBanner")

export const BannersList = reatomComponent(({ ctx }) => {
  const data = ctx.spy(bannersAction.dataAtom)?.data;

  if (ctx.spy(bannersAction.statusesAtom).isPending) {
    return <Skeleton className="h-12 w-full" />
  }

  if (!data) return null;

  return (
    data.map((banner) => (
      <div key={banner.id} className="flex items-center gap-2 justify-between w-full">
        <div className="flex items-center gap-1">
          <Typography>
            {banner.title}
          </Typography>
          <Typography>
            {banner.description}
          </Typography>
          <Typography>
            {banner.href.title} ({banner.href.value})
          </Typography>
        </div>
        <DeleteBanner id={banner.id} />
      </div>
    ))
  )
}, "BannersList")

export const CreateBanner = reatomComponent(({ ctx }) => {
  return (
    <Button onClick={() => createBannerAction(ctx)} className="w-fit px-4 bg-neutral-50">
      <Typography className="text-lg font-semibold text-neutral-950">
        Создать баннер
      </Typography>
    </Button>
  )
}, "CreateBanner")

export const CreateBannerFields = reatomComponent(({ ctx }) => {
  return (
    <>
      <Input
        placeholder="Заголовок"
        value={ctx.spy(bannerTitleAtom)}
        onChange={(e) => bannerTitleAtom(ctx, e.target.value)}
      />
      <Input
        placeholder="Описание"
        value={ctx.spy(bannerDescriptionAtom)}
        onChange={(e) => bannerDescriptionAtom(ctx, e.target.value)}
      />
      <Input
        placeholder="Заголовок ссылки"
        value={ctx.spy(bannerHrefTitleAtom)}
        onChange={(e) => bannerHrefTitleAtom(ctx, e.target.value)}
      />
      <Input
        placeholder="Ссылка"
        value={ctx.spy(bannerHrefValueAtom)}
        onChange={(e) => bannerHrefValueAtom(ctx, e.target.value)}
      />
    </>
  )
}, "CreateBannerFields")

export const CreateNews = reatomComponent(({ ctx }) => {
  return (
    <Button onClick={() => createNewsAction(ctx)} className="w-fit px-4 bg-neutral-50">
      <Typography className="text-lg font-semibold text-neutral-950">
        Создать новость
      </Typography>
    </Button>
  )
}, "CreateNews")

export const CreateNewsFields = reatomComponent(({ ctx }) => {
  return (
    <>
      <Input
        placeholder="Заголовок"
        value={ctx.spy(newsTitleAtom)}
        onChange={(e) => newsTitleAtom(ctx, e.target.value)}
      />
      <Input
        placeholder="Описание"
        value={ctx.spy(newsDescriptionAtom)}
        onChange={(e) => newsDescriptionAtom(ctx, e.target.value)}
      />
      <Input
        placeholder="Изображение"
        value={ctx.spy(newsImageAtom)}
        onChange={e => newsImageAtom(ctx, e.target.value)}
      />
    </>
  )
}, "CreateNewsFields")

export const DeleteNews = reatomComponent<{ id: number }>(({ ctx, id }) => {
  return (
    <button onClick={() => deleteNewsAction(ctx, id)} disabled={ctx.spy(deleteBannerAction.statusesAtom).isPending}>
      <IconX size={18} />
    </button>
  )
}, "DeleteNews")

export const NewsList = reatomComponent(({ ctx }) => {
  const data = ctx.spy(newsDataAtom);

  if (ctx.spy(newsAction.statusesAtom).isPending) {
    return <Skeleton className="h-12 w-full" />
  }

  if (!data) return null;

  return (
    data.map((news) => (
      <div key={news.id} className="flex items-center gap-2 justify-between w-full">
        <div className="flex items-center gap-2">
          <img src={news.imageUrl!} alt={news.title} className="h-24 w-36 rounded-lg object-cover" />
          <div className="flex items-center gap-1">
            <Typography>
              {news.title}
            </Typography>
            <Typography>
              {news.description}
            </Typography>
          </div>
        </div>
        <DeleteNews id={news.id} />
      </div>
    ))
  )
}, "NewsList")