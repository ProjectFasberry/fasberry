import { Link } from "@/shared/components/config/link";
import { reatomComponent } from "@reatom/npm-react";
import { Typography } from "@repo/ui/typography";
import { IconX } from "@tabler/icons-react";
import { bannerAction, bannerIsExistsAtom, viewBannerAction } from "../models/banner.model";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";

const BannerView = reatomComponent<{ id: number }>(({ ctx, id }) => {
  return (
    <Button
      onClick={() => viewBannerAction(ctx, id)}
      disabled={ctx.spy(viewBannerAction.statusesAtom).isPending}
    >
      <IconX
        className="text-neutral-50 text-lg"
      />
    </Button>
  )
}, "BannerView")

export const Banner = reatomComponent(({ ctx }) => {
  const isExist = ctx.spy(bannerIsExistsAtom);
  if (!isExist) return null;

  return (
    <div className="flex items-center justify-center z-[30] w-full h-[8vh] border-b-2 border-b-green-500 bg-neutral-900">
      <BannerInfo />
    </div>
  )
}, "Banner")

export const BannerInfo = reatomComponent(({ ctx }) => {
  const data = ctx.spy(bannerAction.dataAtom);

  if (ctx.spy(bannerAction.statusesAtom).isPending) {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-1">
          <div className="flex flex-col items-center justify-center gap-1 min-w-0 pointer-events-none">
            <Skeleton className="h-6 w-24"/>
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-6 w-12" />
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2">
          <Skeleton className="h-6 w-6" />
        </div>
      </div>
    )
  }
 
  if (!data) return;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-1">
        <div className="flex flex-col min-w-0 pointer-events-none">
          <Typography className='text-lg truncate font-semibold text-neutral-50'>
            {data.title}
          </Typography>
          {data.description && (
            <Typography className='truncate text-neutral-300'>
              {data.title}
            </Typography>
          )}
        </div>
        <Link href={data.href.value} className="underline">
          <Typography className="text-sm text-neutral-200">
            {data.href.title}
          </Typography>
        </Link>
      </div>
      <div className="absolute right-6 top-1/2 -translate-y-1/2">
        <BannerView id={data.id} />
      </div>
    </div>
  )
}, 'BannerInfo')