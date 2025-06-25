import { Carousel, CarouselContent, CarouselIndicator, CarouselItem, CarouselNavigation } from "@/shared/ui/carousel";
import { MorphingDialog, MorphingDialogClose, MorphingDialogContainer, MorphingDialogContent, MorphingDialogTrigger } from "@/shared/ui/morph-dialog";
import { atom } from "@reatom/core";
import { reatomComponent } from "@reatom/npm-react";
import { commuinityGallery } from "@repo/shared/wiki/data/community/community-list";

const selectedKeyAtom = atom(0, "selectedKey")

const CarouselGallery = reatomComponent(({ ctx }) => {
  const selected = ctx.spy(selectedKeyAtom)

  return (
    <Carousel disableDrag={false} index={selected} onIndexChange={v => selectedKeyAtom(ctx, v)}>
      <CarouselContent>
        {commuinityGallery.map((image, i) => (
          <CarouselItem key={i} className="max-h-[720px] relative">
            <img draggable={false} src={image} alt="" className="select-none w-full object-cover h-full" width={1920} height={1080} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselNavigation alwaysShow />
      <CarouselIndicator className="bottom-2" />
    </Carousel>
  )
})

const GalleryItemDialog = reatomComponent<{ image: string }>(({ ctx, image }) => {
  return (
    <MorphingDialog
      transition={{ type: 'spring', bounce: 0.05, duration: 0.25 }}
    >
      <MorphingDialogTrigger
        className='flex flex-col rounded-md overflow-hidden hover:brightness-50'
      >
        <img
          src={image} width={1280} alt="" height={720} className="w-full sm:h-[96px] md:h-[120px] lg:w-[250px] lg:h-[136px] object-cover"
        />
      </MorphingDialogTrigger>
      <MorphingDialogContainer>
        <MorphingDialogContent
          className='flex flex-col gap-6 xl:flex-row rounded-lg p-0 max-h-[720px] max-w-[1280px] bg-neutral-950 pointer-events-auto relative w-full mx-2'
        >
          <CarouselGallery />
          <MorphingDialogClose />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  )
}, "GalleryItemDialog")


export const CommunityGallery = reatomComponent(({ ctx }) => {
  return (
    commuinityGallery.map((image, idx) => (
      <div key={idx} onClick={() => selectedKeyAtom(ctx, idx)}>
        <GalleryItemDialog image={image} />
      </div>
    ))
  )
}, "CommuinityGalleryItem")