import { HowToConnectOnServer } from "#components/intro/how-to-connect-on-server";
import { MainLayoutPage } from "#components/layout/default/main-layout";
import { Typography } from "@repo/landing-ui/src/typography";
import { FORUM_SITE_DOMAIN, MINECRAFT_SITE_DOMAIN } from "@repo/shared/constants/origin-list";
import Link from "next/link";

export const metadata = {
  title: "Начать играть",
  description:
    "Начать играть на Fasberry сервере.",
  keywords: [
    "Fasberry",
    "начать играть на Fasberry сервере",
    "режимы Fasberry",
    "информация о Fasberry сервере",
  ],
  author: "Fasberry Wiki Team",
  robots: "index, follow",
  canonical: `${MINECRAFT_SITE_DOMAIN}/start`,
  openGraph: {
    siteName: "Начать играть на Fasberry",
    title: "Начать играть",
    description:
      "Начать играть на Fasberry.",
    url: `${MINECRAFT_SITE_DOMAIN}/start`,
    type: "website",
    images: [
      {
        url: "https://mc.fasberry.su/images/backgrounds/rules_background.png",
        alt: "Начать играть на Fasberry",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Начать играть",
    description:
      "Начать играть на Fasberry сервере.",
    images: ["https://mc.fasberry.su/images/backgrounds/rules_background.png"],
  },
}

const NumericItem = ({ index }: { index: number }) => {
  return (
    <div className="flex items-center justify-center border-2 aspect-square border-shark-800 h-8 w-8 lg:h-12 lg:w-12">
      <Typography className="text-black dark:text-white text-xl lg:text-2xl">
        {index}
      </Typography>
    </div>
  )
}

export default async function StartPage() {
  return (
    <MainLayoutPage>
      <div className="flex flex-col items-center w-full gap-12 h-full">
        <Typography className="text-project-color text-2xl lg:text-4xl">
          Как начать играть
        </Typography>
        <div className="flex flex-col gap-6 items-center h-full w-full">
          <div className="flex items-start gap-4 w-full">
            <NumericItem index={1} />
            <Typography className="text-black dark:text-white text-md md:text-xl lg:text-2xl">
              <Link
                href={`${FORUM_SITE_DOMAIN}/auth`}
                target="_blank"
                className="text-green text-shadow-lg hover:underline-offset-8 hover:underline"
              >
                Зарегистрироваться
              </Link>&nbsp;на проекте.
              После регистрации убедитесь, что вы успешно вошли на форум и личный кабинет.
            </Typography>
          </div>
        </div>
        <div className="flex flex-col h-full w-full gap-4">
          <div className="flex items-start gap-4 w-full">
            <NumericItem index={2} />
            <div className="flex flex-col">
              <Typography className="text-black dark:text-white text-md md:text-xl lg:text-2xl">
                Зайди в клиент майнкрафта под ником, который вы указали при регистрации
              </Typography>
              <span className="text-black dark:text-white text-md md:text-xl lg:text-2xl mt-4">P.S:</span>
              <Typography className="text-black dark:text-white text-md md:text-xl lg:text-2xl">
                Если пиратка, рекомендую: <Link href="https://llaun.ch/ru" className="text-neutral-600 dark:text-neutral-400">*тык</Link>
              </Typography>
              <Typography className="text-black dark:text-white text-md md:text-xl lg:text-2xl">
                Если лицензия, рекомендую: <Link href="https://modrinth.com/app" className="text-neutral-600 dark:text-neutral-400">*тык</Link>
              </Typography>
            </div>
          </div>
          <div className="flex h-full lg:h-screen relative w-full">
            <div
              className="absolute w-full h-full lg:h-screen left-0 right-0 top-0 bottom-0"
              style={{ backgroundImage: `url("images/static/dirt.webp")` }}
            />
            <HowToConnectOnServer />
          </div>
        </div>
        <div className="flex items-start gap-4 w-full">
          <NumericItem index={3} />
          <Typography className="text-black dark:text-white text-md md:text-xl lg:text-2xl">
            Удачной игры! <span className="text-red">❤</span>
          </Typography>
        </div>
      </div>
    </MainLayoutPage>
  )
}