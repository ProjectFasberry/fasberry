import { Link } from "@/shared/components/config/Link"
import { CommunityGallery } from "@/shared/components/landing/gallery/community-gallery-item";
import { ContactsSection } from "@/shared/components/landing/intro/contacts-section";
import { IdeaMain } from "@/shared/components/landing/intro/idea-main";
import { MainWrapperPage } from "@/shared/ui/main-wrapper";
import { News } from "@/shared/components/landing/news/news-list";
import { SpawnCarousel } from "@/shared/components/landing/gallery/spawn-carousel";
import { StatusItem } from "@/shared/components/landing/status/status-item";

const URL = "https://kong.fasberry.su/storage/v1/object/public/static/minecraft/underwater.png"

const IntroBackgroundImage = () => {
  return (
    <div
      className="w-full h-full absolute top-0 right-0 brightness-[55%] left-0 bg-no-repeat bg-center bg-cover"
      style={{
        backgroundImage: `url('${URL}')`
      }}
    />
  )
}

export default function IndexPage() {
  return (
    <MainWrapperPage variant="with_section">
      <div
        id="title" className="flex flex-col relative items-start full-screen-section h-[80vh] lg:h-screen justify-center"
      >
        <div className="absolute top-0 right-0 left-0 overflow-hidden h-full">
          <IntroBackgroundImage />
        </div>
        <div className="flex items-center justify-center responsive z-1 mx-auto h-full">
          <div
            className="flex flex-col z-[2] w-full lg:w-[60%] gap-4 justify-center items-center rounded-xl py-4 lg:py-6"
          >
            <div className="flex flex-col gap-1 items-center justify-center w-full">
              <p className="text-green text-center mb-4 text-4xl md:text-5xl xl:text-6xl">
                Добро пожаловать!
              </p>
              <p className="text-shadow-lg text-white text-center text-lg lg:text-3xl">
                Атмосферная и ламповая атмосфера ждет тебя ★
              </p>
            </div>
            <div className="flex sm:flex-row flex-col select-none items-center gap-4 w-full justify-center">
              <Link href="/start" className="w-full sm:w-fit">
                <button
                  className="btn w-full hover:bg-[#088d47] duration-300 bg-[#05b458]"
                >
                  <p className="!text-white text-xl text-shadow-xl">
                    Начать играть
                  </p>
                </button>
              </Link>
              <Link href="#idea" className="w-full sm:w-fit">
                <button
                  className="btn w-full bg-white/10 sm:backdrop-blur-md border-2 border-neutral-400 duration-300"
                >
                  <p className="text-white text-xl text-shadow-xl">
                    О сервере
                  </p>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div
        id="idea" className="full-screen-section relative h-screen flex flex-col items-center justify-center"
      >
        <div className="flex flex-col items-center mx-auto responsive gap-6 justify-center select-none relative">
          <p className="text-xl text-black dark:text-white text-center sm:text-3xl lg:text-4xl">
            ♦ Особенности сервера ♦
          </p>
          <IdeaMain />
        </div>
      </div>
      <div
        id="spawn" className="hidden lg:flex full-screen-section relative h-[80vh] lg:h-screen flex-col items-center justify-center"
      >
        <div className="flex h-[80%] w-[80%] items-center gap-6 justify-center relative">
          <SpawnCarousel />
        </div>
      </div>
      <div className="full-screen-section relative min-h-screen">
        <div className="flex xl:flex-row flex-col py-24 mx-auto gap-y-12 xl:gap-y-6 group gap-x-6 responsive">
          <div
            id="project-news" className="flex flex-col gap-y-6 w-full xl:w-3/5"
          >
            <p className="text-black dark:text-white text-2xl sm:text-3xl lg:text-4xl">
              Новости
            </p>
            <News />
          </div>
          <div
            id="commuinity" className="flex flex-col gap-y-6 w-full xl:w-2/5"
          >
            <p className="text-black dark:text-white text-2xl sm:text-3xl lg:text-4xl">
              Cообщество
            </p>
            <StatusItem />
            <div className="flex flex-col bg-background-light p-4 rounded-xl dark:bg-background-dark h-fit gap-4">
              <p className="text-black dark:text-white text-xl lg:text-2xl">
                Скриншоты от игроков
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-3 auto-rows-auto gap-2">
                <CommunityGallery />
              </div>
            </div>
          </div>
        </div>
      </div>
      <ContactsSection />
    </MainWrapperPage>
  )
}