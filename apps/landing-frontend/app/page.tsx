import { MainLayoutPage } from "#components/layout/default/main-layout";
import { Typography } from '@repo/landing-ui/src/typography';
import { IdeaMain } from '#components/intro/intro-main';
import { CommunityGalleryItem } from '#components/gallery/community-gallery-item';
import { NewsList } from '#components/news/news-list';
import Link from 'next/link';
import { IntroBackgroundImage } from '#components/intro/background-image';
import { StatusItem } from '#components/intro/status-item';
import { Button } from '@repo/landing-ui/src/button';
import { SpawnCarousel } from '#components/intro/spawn-carousel';
import dynamic from 'next/dynamic';
import { MINECRAFT_SITE_DOMAIN } from "@repo/shared/constants/origin-list";

const ContactsSection = dynamic(() => import('#components/contacts/contacts-section').then(m => m.ContactsSection));

export const metadata = {
  title: 'Главная | Fasberry',
  description:
    "Добро пожаловать на Fasberry! Уникальные сервера, захватывающие события и дружелюбное сообщество. Играй с друзьями и создавай свой мир прямо сейчас!",
  keywords: [
    "Fasberry сервер",
    "лучший Minecraft сервер",
    "играть в Fasberry онлайн",
    "Minecraft режимы",
    "Minecraft события",
    "fasberry",
    "fasberry minecraft",
    "minecraft fasberry сервер",
    "Fasberry server",
    "Fasberry project",
    "дружелюбное сообщество Fasberry",
  ],
  author: "Fasberry Server Team",
  robots: "index, follow",
  canonical: MINECRAFT_SITE_DOMAIN,
  openGraph: {
    siteName: "Fasberry Project",
    title: "Fasberry Project",
    description:
      "На нашем Fasberry-сервере ты найдешь всё: новые вещи, уникальные квесты и ламповую атмосферу. Присоединяйся прямо сейчас!",
    url: MINECRAFT_SITE_DOMAIN,
    type: "website",
    images: [
      {
        url: "https://mc.fasberry.su/images/backgrounds/donate_background.png",
        alt: "Fasberry сервер - лучший выбор",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fasberry Сервер | Присоединяйся к лучшим",
    description:
      "Стань частью нашего Minecraft-сервера. Уникальные миры, незабываемые приключения и дружелюбные игроки ждут тебя!",
    images: ["https://mc.fasberry.su/images/backgrounds/donate_background.png"],
  },
};

export default async function Main() {
  return (
    <MainLayoutPage variant="with_section">
      <div
        id="title"
        className="flex flex-col relative items-start full-screen-section h-[80vh] lg:h-screen justify-center"
      >
        <div className="absolute top-0 right-0 left-0 overflow-hidden h-full">
          <IntroBackgroundImage />
        </div>
        <div className="flex items-center justify-center responsive z-1 mx-auto h-full">
          <div
            className="flex flex-col z-[2] w-full lg:w-[60%] gap-4 justify-center items-center rounded-xl py-4 lg:py-6">
            <div className="flex flex-col gap-1 items-center justify-center w-full">
              <Typography className="text-green text-center mb-4 text-4xl md:text-5xl xl:text-6xl">
                Добро пожаловать!
              </Typography>
              <Typography shadow="xl" className="text-white text-center text-lg lg:text-3xl">
                Атмосферная и ламповая атмосфера ждет тебя. А еще печеньки и эмоции  ★
              </Typography>
            </div>
            <div className="flex sm:flex-row flex-col select-none items-center gap-4 w-full justify-center">
              <Link href="/start" className="w-full sm:w-fit">
                <Button
                  className="w-full hover:bg-[#088d47] transition-all 
                    duration-300 ease-in-out bg-[#05b458] rounded-xl"
                >
                  <Typography className="!text-white text-xl text-shadow-xl">
                    Начать играть
                  </Typography>
                </Button>
              </Link>
              <Link href="#idea" className="w-full sm:w-fit">
                <Button
                  className="w-full bg-white/10 sm:backdrop-blur-md 
                    border-2 border-neutral-400 transition-all duration-300 ease-in-out rounded-xl"
                >
                  <Typography className="!text-white text-xl text-shadow-xl">
                    О сервере
                  </Typography>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div
        id="idea"
        className="full-screen-section relative h-screen flex flex-col items-center justify-center"
      >
        <div className="flex flex-col items-center mx-auto responsive gap-6 justify-center select-none relative">
          <Typography text_color="black" className="text-xl text-center sm:text-3xl lg:text-4xl">
            ♦ Особенности сервера ♦
          </Typography>
          <IdeaMain />
        </div>
      </div>
      <div
        id="spawn"
        className="hidden lg:flex full-screen-section relative h-[80vh] lg:h-screen flex-col items-center justify-center"
      >
        <div className="flex h-[80%] w-[80%] items-center gap-6 justify-center relative">
          <SpawnCarousel />
        </div>
      </div>
      <div className="full-screen-section relative min-h-screen">
        <div className="flex xl:flex-row flex-col py-24 mx-auto gap-y-12 xl:gap-y-6 group gap-x-6 responsive">
          <div
            id="project-news"
            className="flex flex-col gap-y-6 w-full xl:w-3/5"
          >
            <Typography text_color="black" className="text-2xl sm:text-3xl lg:text-4xl">
              Новости
            </Typography>
            <NewsList />
          </div>
          <div
            id="commuinity"
            className="flex flex-col gap-y-6 w-full xl:w-2/5"
          >
            <Typography text_color="black" className="text-2xl sm:text-3xl lg:text-4xl">
              Cообщество
            </Typography>
            <StatusItem />
            <div
              className="flex flex-col bg-background-light p-4 rounded-xl dark:bg-background-dark h-fit gap-y-4 border-2 border-neutral-600"
            >
              <Typography text_color="adaptiveWhiteBlack" className="text-xl lg:text-2xl">
                Скриншоты от игроков
              </Typography>
              <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-3 auto-rows-auto gap-2">
                <CommunityGalleryItem />
              </div>
            </div>
          </div>
        </div>
      </div>
      <ContactsSection />
    </MainLayoutPage>
  );
}