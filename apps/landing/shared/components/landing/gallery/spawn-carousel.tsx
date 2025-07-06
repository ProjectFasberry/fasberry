import { Carousel, CarouselContent, CarouselIndicator, CarouselItem, CarouselNavigation } from '@repo/ui/carousel';
import { Typography } from '@repo/ui/typography';
import { atom } from '@reatom/core';
import { reatomComponent } from '@reatom/npm-react';

const SPAWN_IMAGES = [
  "https://kong.fasberry.su/storage/v1/object/public/static/minecraft/offenburg-1.webp",
  "https://kong.fasberry.su/storage/v1/object/public/static/minecraft/offenburg-2.webp",
  "https://kong.fasberry.su/storage/v1/object/public/static/minecraft/offenburg-3.webp",
  "https://kong.fasberry.su/storage/v1/object/public/static/minecraft/offenburg-4.webp",
  "https://kong.fasberry.su/storage/v1/object/public/static/minecraft/offenburg-5.webp",
]

const selectedKeyAtom = atom(0, "selectedKey")

export const SpawnCarousel = reatomComponent(({ ctx }) => {
  const selected = ctx.spy(selectedKeyAtom)

  return (
    <div className="flex items-center justify-center relative w-full overflow-hidden rounded-xl h-full">
      <Carousel className="z-20 w-full h-full" index={selected} onIndexChange={v => selectedKeyAtom(ctx, v)}>
        <CarouselIndicator className='bottom-16' />
        <CarouselContent>
          {SPAWN_IMAGES.map((image, index) => {
            return (
              <CarouselItem key={index} className="w-full h-screen">
                <img
                  src={image}
                  draggable={false}
                  className="w-full select-none brightness-75 h-full rounded-xl object-cover"
                  width={1920}
                  height={1080}
                  loading="lazy"
                  alt=""
                />
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </Carousel>
      <div className="select-none flex absolute bottom-24 right-0 left-0 w-full items-end justify-center h-full">
        <div className="flex flex-col bg-white/10 backdrop-blur-sm px-2 py-4 rounded-sm border-2 border-neutral-600 w-full gap-2 z-[21] lg:w-[40%]">
          <Typography color="white" className="text-xl leading-6 text-center">
            Спавн сервера
          </Typography>
          <Typography color="gray" className="!leading-5 text-base text-center">
            Спавном сервера является город Оффенбург, в котором можно найти много интересных и даже секретных мест,
            персонажей, с которыми можно пообщаться и прочие активности.
          </Typography>
        </div>
      </div>
    </div>
  )
}, "SpawnCarousel")