import { Typography } from "@repo/ui/typography";
import { getStaticImage } from "@/shared/lib/volume-helpers";
import { PropsWithChildren } from "react";

const ratingsImage = getStaticImage("arts/sand-camel.jpg")

const RatingsPreviewImage = () => {
  return (
    <div className="flex select-none flex-col items-center justify-end relative overflow-hidden h-[180px] rounded-lg w-full">
      <img
        src={ratingsImage}
        draggable={false}
        alt=""
        width={800}
        height={800}
        className="absolute w-full h-[210px] rounded-lg object-cover"
      />
      <div className="absolute bottom-0 bg-gradient-to-t h-[60px] from-black/60 via-black/20 to-transparent w-full" />
    </div>
  )
}

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col gap-6 w-full h-full">
      <RatingsPreviewImage />
      <div className="flex flex-col gap-4 h-full w-full">
        <Typography className="font-semibold text-3xl">
          Рейтинги сервера
        </Typography>
        {children}
      </div>
    </div>
  )
}