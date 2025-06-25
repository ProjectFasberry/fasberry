import { Typography } from '@/shared/ui/typography';
import { Carousel } from '@ark-ui/react';
import { action, atom } from '@reatom/core';
import { reatomComponent } from '@reatom/npm-react';
import { tv } from 'tailwind-variants';

const SPAWN_IMAGES = [
  "https://kong.fasberry.su/storage/v1/object/public/static/minecraft/offenburg-1.png",
  "https://kong.fasberry.su/storage/v1/object/public/static/minecraft/offenburg-2.png",
  "https://kong.fasberry.su/storage/v1/object/public/static/minecraft/offenburg-3.png",
  "https://kong.fasberry.su/storage/v1/object/public/static/minecraft/offenburg-4.png",
  "https://kong.fasberry.su/storage/v1/object/public/static/minecraft/offenburg-5.png",
]

const selectedKeyAtom = atom(0, "selectedKey")

const control = action((ctx, type: "next" | "prev") => {
  const target = ctx.get(selectedKeyAtom)

  switch (type) {
    case "prev":
      if (target > 0) {
        selectedKeyAtom(ctx, state => state - 1)
      }

      break;
    case "next":
      if (target < SPAWN_IMAGES.length - 1) {
        selectedKeyAtom(ctx, state => state + 1)
      }

      break;
  }
})

const controlTrigger = tv({
  base: `flex z-[7] cursor-pointer bg-neutral-900/60 rounded-md data-[state=disabled]:pointer-events-none data-[state=disabled]:opacity-40 
    h-8 w-8 absolute top-1/2 bottom-0 gap-2 items-center justify-center`
})

export const SpawnCarousel = reatomComponent(({ ctx }) => {
  const selected = ctx.spy(selectedKeyAtom)

  return (
    <div className="flex items-center justify-center w-full overflow-hidden rounded-xl h-full">
      <Carousel.Root
        loop={true}
        className='w-full z-[5] h-full'
        defaultPage={0}
        allowMouseDrag={true}
        slideCount={SPAWN_IMAGES.length}
        page={selected}
        onPageChange={(e) => selectedKeyAtom(ctx, e.page)}
      >
        <Carousel.IndicatorGroup>
          {SPAWN_IMAGES.map((_, index) => <Carousel.Indicator key={index} index={index} />)}
        </Carousel.IndicatorGroup>
        <Carousel.ItemGroup>
          {SPAWN_IMAGES.map((image, index) => (
            <Carousel.Item key={index} index={index} className="w-full h-screen">
              <img src={image} className="w-full brightness-75 h-full rounded-xl object-cover" width={1920} height={1080} alt="" />
            </Carousel.Item>
          ))}
        </Carousel.ItemGroup>
      </Carousel.Root>
      <div
        data-state={selected === 0 ? "disabled" : "active"}
        onClick={() => control(ctx, "prev")}
        className={controlTrigger({ className: "left-4" })}
      >
        <p className="text-xl text-white text-center">{`<`}</p>
      </div>
      <div
        data-state={selected + 1 === SPAWN_IMAGES.length ? "disabled" : "active"}
        onClick={() => control(ctx, "next")}
        className={controlTrigger({ className: "right-4" })}
      >
        <p className="text-xl text-white text-center">{`>`}</p>
      </div>
      <div className="flex absolute bottom-4 right-0 left-0 w-full items-end justify-center h-full">
        <div className="flex flex-col bg-white/10 backdrop-blur-md p-2 rounded-xl w-full gap-2 z-[6] lg:w-[50%]">
          <Typography color="white" className="text-2xl leading-6 font-semibold text-center">
            Спавн сервера
          </Typography>
          <Typography color="gray" className="!leading-5 text-lg text-center">
            Спавном сервера является город Оффенбург, в котором можно найти много интересных и даже секретных мест,
            персонажей, с которыми можно пообщаться и прочие активности.
          </Typography>
        </div>
      </div>
    </div>
  )
}, "SpawnCarousel")