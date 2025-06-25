import { ModpackList } from "@/shared/components/landing/modpacks/modpack-list";
import { MainWrapperPage } from "@/shared/ui/main-wrapper";
import { Typography } from "@/shared/ui/typography";

export const metadata = {
  title: 'Модпак',
};

export default function WikiModpackPage() {
  return (
    <MainWrapperPage variant="with_section">
      <div className="min-h-screen w-[90%] mx-auto py-36">
        <div className="flex flex-col justify-center items-center mb-6">
          <Typography variant="page-title">
            Сборки модов
          </Typography>
        </div>
        <ModpackList />
      </div>
    </MainWrapperPage>
  );
}