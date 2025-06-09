"use client"

import { Dialog, DialogContent, DialogTrigger } from "@repo/landing-ui/src/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselApi, CarouselNext, CarouselPrevious } from "@repo/landing-ui/src/carousel";
import { commuinityGallery } from "@repo/shared/wiki/data/community/community-list";
import { useEffect, useState } from "react";

export const CommunityGalleryItem = () => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (api && selectedIndex !== null) {
      api.scrollTo(selectedIndex, true)
    };
  }, [api, selectedIndex]);

  return (
    <>
      {commuinityGallery.map((image, i) => (
        <Dialog key={i}>
          <DialogTrigger onClick={() => setSelectedIndex(i)}>
            <div
              className="flex flex-col rounded-[6px] overflow-hidden cursor-pointer hover:duration-300 hover:brightness-50 duration-300"
            >
              <img
                src={image}
                width={1280}
                alt=""
                loading="lazy"
                height={720}
                className="w-full sm:h-[96px] md:h-[120px] lg:w-[250px] lg:h-[136px] object-cover"
              />
            </div>
          </DialogTrigger>
          <DialogContent className="bg-opacity-60 border-none p-0 max-h-[720px] max-w-[1280px]">
            <Carousel
              setApi={setApi}
              opts={{
                align: "start",
                dragFree: false,
                loop: true,
              }}
            >
              <CarouselContent>
                {commuinityGallery.map((image, i) => (
                  <CarouselItem key={i} className="max-h-[720px] !p-0 relative">
                    <img
                      src={image}
                      alt=""
                      loading="lazy"
                      className="w-full object-cover h-full"
                      width={1920}
                      height={1080}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </DialogContent>
        </Dialog>
      ))}
    </>
  )
}