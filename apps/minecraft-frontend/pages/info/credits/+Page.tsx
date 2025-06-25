import { Typography } from '@repo/landing-ui/src/typography';
import Bzzvanet from '@repo/assets/images/credits-bzzvanet.jpg';
import { MainWrapperPage } from '@/shared/ui/main-wrapper';

export default function CreditsPage() {
  return (
    <MainWrapperPage variant="with_section">
      <div className="flex flex-col min-h-screen responsive mx-auto py-36 gap-y-6">
        <Typography className="text-black dark:text-white text-3xl">
          Отдельные благодарности
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-auto gap-4 w-full h-full">
          <a href="https://linktr.ee/bzzvanet" className="flex items-center justify-center relative group rounded-[12px] overflow-hidden">
            <div
              className="flex items-end p-4 justify-center group-hover:backdrop-blur-lg w-full group-hover:duration-300 duration-300 transition-all h-full absolute"
            >
              <div
                className="flex justify-center items-center group-hover:duration-300 duration-300 transition-all group-hover:translate-y-0 translate-y-64 flex-col gap-y-2"
              >
                <Typography className="text-white text-2xl font-bold">
                  Изображения
                </Typography>
                <Typography size="lg" className="text-fuchsia-300">
                  bzzVanet
                </Typography>
              </div>
            </div>
            <img src={Bzzvanet} loading="lazy" alt="" />
          </a>
        </div>
      </div>
    </MainWrapperPage>
  );
}