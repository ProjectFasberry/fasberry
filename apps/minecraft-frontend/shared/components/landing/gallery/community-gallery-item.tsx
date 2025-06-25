import { Dialog, Carousel, Portal } from "@ark-ui/react";
import { action, atom } from "@reatom/core";
import { sleep, withReset } from "@reatom/framework";
import { reatomComponent } from "@reatom/npm-react";
import { commuinityGallery } from "@repo/shared/wiki/data/community/community-list";

const selectedKeyAtom = atom(0, "selectedKey")
const selectedItem = atom<{ idx: number, img: string } | null>(null, "selectedItem").pipe(withReset())
const galleryItemDialogIsOpen = atom(false, "galleryItemDialogIsOpen")

const openGalleryItem = action((ctx, values: { idx: number, img: string }) => {
  selectedItem(ctx, values)
  galleryItemDialogIsOpen(ctx, true)
})

galleryItemDialogIsOpen.onChange(async (ctx, target) => {
  if (!target) {
    await sleep(200)
    selectedItem.reset(ctx)
  }
})

const GalleryItemDialog = reatomComponent(({ ctx }) => {
  const item = ctx.spy(selectedItem)
  if (!item) return;

  const selected = ctx.spy(selectedKeyAtom)

  return (
    <Dialog.Root open={ctx.spy(galleryItemDialogIsOpen)} onOpenChange={v => galleryItemDialogIsOpen(ctx, v.open)}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content className="bg-opacity-60 border-none p-0 max-h-[720px] max-w-[1280px]">
            <Carousel.Root
              page={selected}
              onPageChange={e => selectedKeyAtom(ctx, e.page)}
              slideCount={commuinityGallery.length}
            >
              <Carousel.ItemGroup>
                {commuinityGallery.map((image, i) => (
                  <Carousel.Item key={i} index={i} className="max-h-[720px] !p-0 relative">
                    <img src={image} alt="" className="w-full object-cover h-full" width={1920} height={1080} />
                  </Carousel.Item>
                ))}
              </Carousel.ItemGroup>
              <Carousel.PrevTrigger />
              <Carousel.NextTrigger />
            </Carousel.Root>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}, "GalleryItemDialog")

export const CommunityGallery = reatomComponent(({ ctx }) => {
  return (
    <>
      <GalleryItemDialog />
      {commuinityGallery.map((image, idx) => (
        <div
          key={idx}
          onClick={() => openGalleryItem(ctx, { img: image, idx })}
          className="flex flex-col rounded-md overflow-hidden cursor-pointer hover:brightness-50 duration-300"
        >
          <img
            src={image} width={1280} alt="" height={720} className="w-full sm:h-[96px] md:h-[120px] lg:w-[250px] lg:h-[136px] object-cover"
          />
        </div>
      ))}
    </>
  )
}, "CommuinityGalleryItem")