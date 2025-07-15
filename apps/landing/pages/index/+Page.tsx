import { Link } from "@/shared/components/config/link"
import { IdeaMain } from "@/shared/components/landing/intro/idea-main";
import { MainWrapperPage } from "@repo/ui/main-wrapper";
import { SpawnCarousel } from "@/shared/components/landing/gallery/spawn-carousel";
import { Button } from "@repo/ui/button";
import { Typography } from "@repo/ui/typography";
import { CONTACTS_LIST } from "@repo/shared/wiki/data/contacts/contacts-list";
import { tv } from "tailwind-variants";

const INTRO_URL = "https://volume.fasberry.su/static/arts/server-status-widget.webp"
const SHARE_URL = "https://volume.fasberry.su/static/arts/bzzvanet-.jpg"

const sectionVariant = tv({
  base: `full-screen-section relative h-[80vh] lg:h-screen flex-col items-center justify-center`,
  variants: {
    variant: {
      default: "flex",
      hidden: "hidden lg:flex"
    }
  },
  defaultVariants: {
    variant: "default"
  }
})

export default function IndexPage() {
  return (
    <MainWrapperPage variant="with_section">
      <div id="title" className={sectionVariant()}>
        <div className="absolute top-0 right-0 left-0 overflow-hidden h-full">
          <div
            className="w-full h-full absolute top-0 right-0 brightness-[55%] left-0 bg-no-repeat bg-center bg-cover"
            style={{ backgroundImage: `url('${INTRO_URL}')` }}
          />
        </div>
        <div className="flex items-center justify-start responsive z-1 mx-auto h-full">
          <div
            className="flex flex-col z-[2] w-full px-2 sm:px-0 lg:w-[50%] gap-2 sm:gap-4 justify-start items-center rounded-xl py-4 lg:py-6"
          >
            <div className="flex flex-col items-start justify-center w-full">
              <h1 className=" text-pink-300 mb-4 text-3xl md:text-4xl xl:text-5xl">
                Fasberry Project
              </h1>
              <h2 className="text-white mb-4 text-xl md:text-2xl xl:text-3xl">
                Полуванильный сервер 1.20.4+
              </h2>
              <h3 className="text-white text-shadow-lg text-lg lg:text-xl">
                Ламповый, ванильный сервер с приятной атмосферой и дружелюбными игроками! Присоединяйся с друзьями чиллить вместе!
                <span className="font-[Monocraft]">♦</span>
              </h3>
            </div>
            <div className="flex sm:flex-row flex-col mt-2 select-none items-start gap-4 w-full justify-start">
              <Link href="/start" className="mx-auto w-[calc(100%-16px)] sm:mx-0 sm:w-1/2">
                <Button variant="minecraft" draggable={false} className="w-full py-0.5" >
                  <Typography color="white" className="text-nowrap text-xl text-shadow-xl">
                    Начать играть
                  </Typography>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div id="features" className={sectionVariant()}>
        <div className="flex flex-col items-center mx-auto responsive gap-6 justify-center select-none relative">
          <Typography color="white" className="text-xl text-center sm:text-3xl lg:text-4xl">
            Особенности сервера
          </Typography>
          <IdeaMain />
        </div>
      </div>
      <div id="spawn" className={sectionVariant({ variant: "hidden" })}>
        <div className="flex items-center gap-6 justify-center relative">
          <SpawnCarousel />
        </div>
      </div>
      <div id="share" className={sectionVariant()}>
        <div className="absolute top-0 right-0 left-0 overflow-hidden h-full">
          <div
            className="w-full h-full absolute top-0 right-0 brightness-[55%] left-0 bg-no-repeat bg-center bg-cover"
            style={{ backgroundImage: `url('${SHARE_URL}')` }}
          />
        </div>
        <div className="flex flex-col items-center z-1 mx-auto responsive gap-12 justify-center select-none relative">
          <Typography color="white" className="text-center text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl">
            Соцсети проекта
          </Typography>
          <div className="flex flex-col gap-4 justify-center items-center sm:w-1/4 *:w-full w-full h-full">
            {CONTACTS_LIST.map(item => (
              <a href={item.href} target="_blank" rel="noreferrer">
                <Button key={item.name} variant="minecraft" className="w-full py-0.5">
                  <Typography className="text-white text-lg">
                    Перейти в {item.name}
                  </Typography>
                </Button>
              </a>
            ))}
          </div>
        </div>
      </div>
    </MainWrapperPage>
  )
}