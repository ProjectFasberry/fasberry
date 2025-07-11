import { MainWrapperPage } from '@repo/ui/main-wrapper';
import { Typography } from '@repo/ui/typography';

export default function CreditsPage() {
  return (
    <MainWrapperPage variant="with_section">
      <div className="flex flex-col min-h-screen responsive mx-auto py-36 gap-y-6">
        <Typography className="text-white text-3xl">
          Отдельные благодарности
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-auto gap-4 w-full h-full">
          <a
            href="https://linktr.ee/bzzvanet"
            target="_blank"
            className="flex items-end p-4 justify-center relative group hover:backdrop-blur-md duration-300 rounded-lg h-full overflow-hidden"
          >
            <div className="flex flex-col justify-center items-center duration-300 absolute group-hover:translate-y-0 translate-y-64 gap-2">
              <Typography color="white" className="text-2xl font-semibold">Изображения</Typography>
              <Typography className="text-lg text-fuchsia-300">bzzVanet</Typography>
            </div>
            <img src="https://volume.fasberry.su/static/arts/credits-bzzvanet.jpg" loading="lazy" alt="" />
          </a>
        </div>
      </div>
    </MainWrapperPage>
  );
}