import { cardWrapper } from "@/shared/styles/variants";
import { MainWrapperPage } from "@repo/ui/main-wrapper";
import { Typography } from "@repo/ui/typography";
import { Link } from "@/shared/components/config/link";
import { reatomComponent } from "@reatom/npm-react";
import { Skeleton } from "@repo/ui/skeleton";
import { typographyVariants } from "@repo/ui/typography";
import { tv } from "tailwind-variants";
import { Button } from "@repo/ui/button";
import { getStaticObject } from "@/shared/lib/volume";
import { Carousel, CarouselContent, CarouselIndicator, CarouselItem, CarouselNavigation } from "@repo/ui/carousel";
import { MorphingDialog, MorphingDialogClose, MorphingDialogContainer, MorphingDialogContent, MorphingDialogTrigger } from "@repo/ui/morph-dialog";
import { atom } from "@reatom/core";
import { COMMUNITY_FOLDER_ITEM } from "@/shared/data/folders";
import { serverStatusAction } from "@/shared/components/landing/status/models/status.model";

const serverTitle = tv({
	extend: typographyVariants,
	base: `text-md sm:text-base md:text-lg lg:text-xl`
})

const descTitle = tv({
	extend: typographyVariants,
	base: `text-md sm:text-base text-neutral-400 truncate md:text-lg lg:text-xl`
})

const StatusItem = reatomComponent(({ ctx }) => {
	const status = ctx.spy(serverStatusAction.dataAtom);
	const isLoading = ctx.spy(serverStatusAction.statusesAtom).isPending

	const serverOnline = status?.proxy.online ?? 0

	return (
		<div className={cardWrapper({ className: "flex flex-col h-fit gap-4" })}>
			<Typography className="text-xl lg:text-2xl">
				Статус
			</Typography>
			<div className="flex flex-col items-start gap-4">
				<div className="flex flex-col gap-2 w-full">
					<div className="grid grid-cols-[1fr_1fr] grid-rows-1 w-full bg-neutral-800 p-2 rounded-lg">
						<div className="flex items-center gap-3">
							<div className="hidden sm:flex items-center justify-center bg-neutral-700/40 rounded-lg p-2">
								<img
									src={getStaticObject("items", "netherite_sword.webp")}
									alt=""
									width={24}
									draggable={false}
									height={24}
								/>
							</div>
							<Typography className={serverTitle()}>Bisquite</Typography>
						</div>
						<div className="flex items-center w-full justify-end gap-3">
							{isLoading ? <Skeleton className="h-8 w-24" /> : (
								<Typography color="gray" className={descTitle()}>
									<span className="hidden sm:inline">играет</span> {status?.servers.bisquite.online} игроков
								</Typography>
							)}
						</div>
					</div>
					<div className="grid grid-cols-[1fr_1fr] gap-2 grid-rows-1 w-full bg-neutral-800 p-2 rounded-lg">
						<div className="flex items-center gap-3">
							<div className="hidden sm:flex items-center justify-center bg-neutral-700/40 rounded-lg p-2">
								<img
									src={getStaticObject("items", "wild_armor_trim_ыmithing_еemplate.webp")}
									alt=""
									width={24}
									draggable={false}
									height={24}
								/>
							</div>
							<Typography className={serverTitle()}>Muffin</Typography>
						</div>
						<div className="flex items-center w-full justify-end gap-3">
							<Typography className={descTitle()}>в разработке...</Typography>
						</div>
					</div>
				</div>
				<div className="flex items-center justify-between w-full">
					{isLoading ? (
						<div className="flex items-center gap-2">
							<Typography className={descTitle({ className: "text-right" })}>
								Всего:
							</Typography>
							<Skeleton className="h-8 w-8" />
						</div>
					) : (
						<Typography className={descTitle({ className: "text-right" })}>
							Всего: {serverOnline}
						</Typography>
					)}
					<Link href={"/status"}>
						<Button className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700">
							<Typography className="text-md sm:text-base md:text-lg lg:text-xl">
								Статус
							</Typography>
						</Button>
					</Link>
				</div>
			</div>
		</div>
	)
}, "StatusItem")

const commuinityGallery = [
  COMMUNITY_FOLDER_ITEM("moon"),
  COMMUNITY_FOLDER_ITEM("sunset"),
  COMMUNITY_FOLDER_ITEM("market"),
  COMMUNITY_FOLDER_ITEM("duck"),
  COMMUNITY_FOLDER_ITEM("dragon_dead"),
  COMMUNITY_FOLDER_ITEM("hills"),
  COMMUNITY_FOLDER_ITEM("market_seller"),
  COMMUNITY_FOLDER_ITEM("offenburg"),
  COMMUNITY_FOLDER_ITEM("night"),
  COMMUNITY_FOLDER_ITEM("water_sand"),
  COMMUNITY_FOLDER_ITEM("early_sunset"),
];

const selectedKeyAtom = atom(0, "selectedKey")

const CarouselGallery = reatomComponent(({ ctx }) => {
  const selected = ctx.spy(selectedKeyAtom)

  return (
    <Carousel disableDrag={false} index={selected} onIndexChange={v => selectedKeyAtom(ctx, v)}>
      <CarouselContent>
        {commuinityGallery.map((image, i) => (
          <CarouselItem key={i} className="max-h-[720px] relative">
            <img
              draggable={false}
              loading="lazy"
              src={image}
              alt=""
              className="select-none w-full object-cover h-full"
              width={1920}
              height={1080}
            />
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
        className='flex flex-col rounded-xl overflow-hidden hover:brightness-50'
      >
        <img
          src={image} loading="lazy" width={1280} alt="" height={720} className="w-auto object-cover"
        />
      </MorphingDialogTrigger>
      <MorphingDialogContainer>
        <MorphingDialogContent
          className='flex flex-col gap-6 xl:flex-row rounded-lg p-0 max-h-[720px]
            max-w-[1280px] bg-neutral-950 pointer-events-auto relative w-full mx-2'
        >
          <CarouselGallery />
          <MorphingDialogClose />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  )
}, "GalleryItemDialog")

const CommunityGallery = reatomComponent(({ ctx }) => {
  return commuinityGallery.map((image, idx) => (
    <div key={idx} onClick={() => selectedKeyAtom(ctx, idx)}>
      <GalleryItemDialog image={image} />
    </div>
  ))
}, "CommunityGallery")

export default function GalleryPage() {
  return (
    <MainWrapperPage>
      <div id="commuinity" className="flex flex-col gap-y-6 w-full">
        <StatusItem />
        <div className={cardWrapper({ className: "flex flex-col h-fit gap-4" })}>
          <Typography color="white" className="text-xl lg:text-2xl">
            Скриншоты от игроков
          </Typography>
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-3 auto-rows-auto gap-2">
            <CommunityGallery />
          </div>
        </div>
      </div>
    </MainWrapperPage>
  )
}
