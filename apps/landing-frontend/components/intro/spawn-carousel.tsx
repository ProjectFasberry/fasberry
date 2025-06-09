"use client"

import { Carousel, CarouselApi, CarouselContent, CarouselItem } from '@repo/landing-ui/src/carousel';
import { Typography } from '@repo/landing-ui/src/typography';
import { useEffect, useState } from 'react';

const SPAWN_IMAGES = [
  "https://kong.fasberry.su/storage/v1/object/public/static/minecraft/offenburg-1.png",
  "https://kong.fasberry.su/storage/v1/object/public/static/minecraft/offenburg-2.png",
  "https://kong.fasberry.su/storage/v1/object/public/static/minecraft/offenburg-3.png",
  "https://kong.fasberry.su/storage/v1/object/public/static/minecraft/offenburg-4.png",
  "https://kong.fasberry.su/storage/v1/object/public/static/minecraft/offenburg-5.png",
]

export const SpawnCarousel = () => {
  const [sel, setSel] = useState<number>(0);
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (api && sel !== null) api.scrollTo(sel, true);
  }, [api, sel]);

  return (
    <div className="flex items-center justify-center w-full h-full overflow-hidden rounded-xl">
      <Carousel
        className="w-full z-[5] h-full"
        setApi={setApi}
        opts={{ align: "start", dragFree: false, loop: true, slidesToScroll: 1 }}
      >
        <CarouselContent>
          {SPAWN_IMAGES.map((image, i) => (
            <CarouselItem key={i} className="!p-0 w-full h-screen">
              <img src={image} className="w-full brightness-75 h-full object-cover" width={1920} height={1080} alt="" />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div
        onClick={() => sel > 0 && setSel(sel - 1)}
        className="flex z-[7] cursor-pointer bg-neutral-900/60 rounded-lg h-10 w-10 absolute left-4 top-1/2 bottom-0  gap-2 items-center justify-center">

        <Typography className="text-xl text-white text-center">
          {`<`}
        </Typography>
      </div>
      <div
        onClick={() => sel < SPAWN_IMAGES.length - 1 && setSel(sel + 1)}
        className="flex z-[7] cursor-pointer bg-neutral-900/60 rounded-lg h-10 w-10 absolute right-4 top-1/2 bottom-0 gap-2 items-center justify-center"
      >
        <Typography className="text-xl text-white text-center">
          {`>`}
        </Typography>
      </div>
      <div className="flex absolute bottom-8 right-0 left-0 w-full items-end justify-center h-full">
        <div className="flex flex-col w-full gap-2 z-[6] lg:w-[50%]">
          <Typography className="!text-white text-2xl font-semibold text-center">
            Спавн сервера
          </Typography>
          <Typography className="!text-white text-lg text-center">
            Спавном сервера является город Оффенбург, в котором можно найти много интересных и даже секретных мест,
            персонажей, с которыми можно пообщаться и прочие активности.
          </Typography>
        </div>
      </div>
    </div>
  )
}