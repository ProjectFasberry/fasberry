import { CommunityGallery } from "@/shared/components/landing/gallery/community-gallery-item";
import { StatusItem } from "@/shared/components/landing/status/status-item";
import { MainWrapperPage } from "@repo/ui/main-wrapper";
import { Typography } from "@repo/ui/typography";

export default function GalleryPage() {
  return (
    <MainWrapperPage>
      <div id="commuinity" className="flex flex-col gap-y-6 w-full">
        <StatusItem />
        <div className="flex flex-col p-4 rounded-xl bg-neutral-900 h-fit gap-4">
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