import { ModpackList } from "@/shared/components/landing/modpacks/modpack-list";
import { MainWrapperPage } from "@repo/ui/main-wrapper";
import { Typography } from "@repo/ui/typography";

export default function WikiModpackPage() {
  return (
    <MainWrapperPage variant="with_section">
      <div className="min-h-screen w-[90%] mx-auto py-36">
        <div className="flex flex-col justify-center items-center mb-6">
          <Typography className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl">
            Сборки модов
          </Typography>
        </div>
        <ModpackList />
      </div>
    </MainWrapperPage>
  );
}