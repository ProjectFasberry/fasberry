import { reatomComponent, useUpdate } from "@reatom/npm-react"
import {
  createBannerDescriptionAtom,
  createBannerHrefTitleAtom,
  createBannerHrefValueAtom,
  bannersAction,
  createBannerTitleAtom,
  createBannerAction,
  deleteBannerAction
} from "../models/actions.model"
import { Skeleton } from "@repo/ui/skeleton"
import { Button } from "@repo/ui/button"
import { Typography } from "@repo/ui/typography"
import { Input } from "@repo/ui/input"
import { BannerPayload } from "@repo/shared/types/entities/banner"
import { action, atom } from "@reatom/core"
import { sleep, withReset } from "@reatom/framework"
import { IconEye, IconX } from "@tabler/icons-react"
import { Dialog, DialogContent, DialogTitle } from "@repo/ui/dialog"

const showBannerDialogIsOpenAtom = atom(false)
const showBannerItemAtom = atom<BannerPayload | null>(null).pipe(withReset())

const controlShowBannerAction = action(async (ctx, value: boolean, id?: number) => {
  if (value) {
    if (!id) throw new Error('Target banner id is not defined')

    const item = ctx.get(bannersAction.dataAtom)?.data.find(target => target.id === id)
    if (!item) throw new Error('Target banner is not defined')

    showBannerItemAtom(ctx, item)
    showBannerDialogIsOpenAtom(ctx, true)
  } else {
    showBannerDialogIsOpenAtom(ctx, false)
    await sleep(300)
    showBannerItemAtom.reset(ctx)
  }
}, "controlShowBannerAction")

const ShowBanner = reatomComponent<{ id: number }>(({ ctx, id }) => {
  return (
    <Button
      onClick={() => controlShowBannerAction(ctx, true, id)}
      className="h-6 w-6 aspect-square p-0 bg-neutral-800"
    >
      <IconEye size={18} />
    </Button>
  )
})

const ShowBannerDialog = reatomComponent(({ ctx }) => {
  const item = ctx.spy(showBannerItemAtom);
  if (!item) return null;

  return (
    <Dialog open={ctx.spy(showBannerDialogIsOpenAtom)} onOpenChange={v => controlShowBannerAction(ctx, v)}>
      <DialogContent>
        <DialogTitle className="hidden"></DialogTitle>
        <div className="flex flex-col justify-center w-full h-full items-center">
          <Typography className='font-semibold'>
            {item.title}
          </Typography>
          <Typography>
            {item.description}
          </Typography>
          <a href={item.href.value} className="text-green-500 text-sm">
            {item.href.title}
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
})

const DeleteBanner = reatomComponent<{ id: number }>(({ ctx, id }) => {
  return (
    <Button
      onClick={() => deleteBannerAction(ctx, id)}
      disabled={ctx.spy(deleteBannerAction.statusesAtom).isPending}
      className="h-6 w-6 aspect-square p-0 bg-neutral-800"
    >
      <IconX size={18} />
    </Button>
  )
}, "DeleteBanner")

const BannerListItem = ({ id, title, description, href }: BannerPayload) => {
  return (
    <div className="flex items-center gap-2 justify-between w-full h-20 border border-neutral-800 p-2 rounded-lg overflow-hidden">
      <div className="flex flex-col items-start gap-1">
        <div className="flex items-center gap-1">
          <Typography className='font-semibold leading-tight'>
            {title}
          </Typography>
          <Typography>
            {description}
          </Typography>
          <Typography>
            {href.title} ({href.value})
          </Typography>
        </div>
        <div className="flex items-center gap-1">
          <ShowBanner id={id} />
          <DeleteBanner id={id} />
        </div>
      </div>
    </div >
  )
}

export const BannersList = reatomComponent(({ ctx }) => {
  useUpdate(bannersAction, [])

  const data = ctx.spy(bannersAction.dataAtom)?.data;

  if (ctx.spy(bannersAction.statusesAtom).isPending) {
    return <Skeleton className="h-12 w-full" />
  }

  if (!data) return null;

  return (
    <>
      <ShowBannerDialog />
      {data.map(banner => <BannerListItem key={banner.id} {...banner} />)}
    </>
  )
}, "BannersList")

const CreateBannerTitle = reatomComponent(({ ctx }) => {
  return (
    <Input
      placeholder="Заголовок"
      value={ctx.spy(createBannerTitleAtom)}
      onChange={(e) => createBannerTitleAtom(ctx, e.target.value)}
    />
  )
})

const CreateBannerDescription = reatomComponent(({ ctx }) => {
  return (
    <Input
      placeholder="Описание"
      value={ctx.spy(createBannerDescriptionAtom)}
      onChange={(e) => createBannerDescriptionAtom(ctx, e.target.value)}
    />
  )
})

const CreateBannerLinkTitle = reatomComponent(({ ctx }) => {
  return (
    <Input
      placeholder="Заголовок ссылки"
      value={ctx.spy(createBannerHrefTitleAtom)}
      onChange={(e) => createBannerHrefTitleAtom(ctx, e.target.value)}
    />
  )
})

const CreateBannerLinkValue = reatomComponent(({ ctx }) => {
  return (
    <Input
      placeholder="Ссылка"
      value={ctx.spy(createBannerHrefValueAtom)}
      onChange={(e) => createBannerHrefValueAtom(ctx, e.target.value)}
    />
  )
})

export const CreateBannerForm = () => {
  return (
    <>
      <CreateBannerTitle />
      <CreateBannerDescription />
      <CreateBannerLinkTitle />
      <CreateBannerLinkValue />
    </>
  )
}

export const CreateBanner = reatomComponent(({ ctx }) => {
  return (
    <Button
      onClick={() => createBannerAction(ctx)}
      className="w-fit px-4 bg-neutral-50"
      disabled={ctx.spy(createBannerAction.statusesAtom).isPending}
    >
      <Typography className="text-lg font-semibold text-neutral-950">
        Создать баннер
      </Typography>
    </Button>
  )
}, "CreateBanner")