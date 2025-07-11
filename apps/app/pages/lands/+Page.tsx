import { MainWrapperPage } from "@/shared/components/config/wrapper";
import { Typography } from "@repo/ui/typography"
import { LandsList } from "@/shared/components/app/lands/components/lands-list";
import { getStaticImage } from "@/shared/lib/volume-helpers";

const LandsPreviewImage = () => {
  return (
    <div className="flex select-none flex-col items-center justify-end relative overflow-hidden h-[180px] rounded-lg w-full">
      <img
        draggable={false}
        src={getStaticImage("arts/clan-preview.jpg")}
        alt=""
        loading="lazy"
        width={800}
        height={800}
        className="absolute w-full h-[210px] rounded-lg object-cover"
      />
      <div className="absolute bottom-0 bg-gradient-to-t h-[60px] from-black/60 via-black/20 to-transparent w-full" />
    </div>
  )
}

export default function LandsPage() {
  return (
    <MainWrapperPage>
      <div className="flex flex-col gap-4 w-full h-full">
        <LandsPreviewImage />
        <div className="flex flex-col gap-4 h-full w-full">
          <Typography color="white" className="font-semibold text-2xl">
            Территории сервера
          </Typography>
          <LandsList/>
        </div>
      </div>
    </MainWrapperPage>
  )
}