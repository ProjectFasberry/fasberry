import { MainLayoutPage } from "#components/layout/default/main-layout";
import { Overlay } from '@repo/landing-ui/src/overlay';
import { WrapperTitle } from '@repo/landing-ui/src/wrapper-title';
import { Typography } from '@repo/landing-ui/src/typography';
import { Rules as RulesList } from '#components/rules/rules';
import { Button } from '@repo/landing-ui/src/button';
import Link from 'next/link';
import { MINECRAFT_SITE_DOMAIN } from "@repo/shared/constants/origin-list";

export const metadata = {
  title: 'Правила',
  description:
    "Ознакомьтесь с правилами нашего Fasberry-сервера, чтобы обеспечить честную и дружелюбную игру для всех участников. Уважайте других игроков и следуйте установленным нормам поведения.",
  keywords: [
    "правила Fasberry",
    "правила игрового сервера",
    "Fasberry сервер правила",
    "как играть на Fasberry сервере",
    "нормы поведения Fasberry",
  ],
  author: "Fasberry Server Team",
  robots: "index, follow",
  canonical: `${MINECRAFT_SITE_DOMAIN}/rules`,
  openGraph: {
    siteName: "Правила сервера Fasberry",
    title: "Правила сервера Fasberry",
    description:
      "Правила нашего Fasberry-сервера для комфортной игры. Соблюдайте установленные нормы и поддерживайте дружелюбную атмосферу!",
    url: `${MINECRAFT_SITE_DOMAIN}/rules`,
    type: "website",
    images: [
      {
        url: "https://mc.fasberry.su/images/backgrounds/main_background.png",
        alt: "Правила сервера Fasberry",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Правила сервера Fasberry | Соблюдайте порядок",
    description:
      "Изучите правила нашего сервера Fasberry, чтобы играть комфортно и честно. Уважение к игрокам — наш приоритет.",
    images: ["https://mc.fasberry.su/images/backgrounds/main_background.png"],
  },
};

export default async function RulesPage() {
  return (
    <MainLayoutPage variant="with_section">
      <div
        className={`full-screen-section h-[80vh] lg:min-h-screen flex items-center justify-start bg-bottom md:bg-center bg-cover
						bg-[url('/images/backgrounds/rules_background.png')]`}
      >
        <Overlay variant="default" />
        <WrapperTitle>
          <div className="flex flex-col gap-6 w-full lg:max-w-3xl items-start justify-center">
            <div className="flex flex-col gap-1 lg:max-w-3xl">
              <Typography position="left" shadow="xl" className="text-5xl lg:text-6xl text-gold mb-2">
                Правила проекта
              </Typography>
              <Typography position="left" text_color="white" className="text-2xl md:text-3xl">
                Правила созданы для чего? Чтобы их не нарушать!
              </Typography>
            </div>
            <Link href="#rules-list">
              <Button
                size="default"
                variant="pageLink"
                className="hover:bg-[#a20f40] rounded-xl border border-[#8a113c] bg-[#8a113c]"
              >
                <Typography text_color="white" className="font-bold text-xl">
                  <span
                    className="inline-block group-hover:rotate-0 rotate-90 duration-150 group-hover:duration-150"
                  >
                    ✎
                  </span>
                  &nbsp;К правилам
                </Typography>
              </Button>
            </Link>
          </div>
        </WrapperTitle>
      </div>
      <div className="full-screen-section py-32">
        <div className="flex flex-col gap-y-10 responsive mx-auto">
          <div
            className="flex flex-col md:flex-row gap-y-4 border-2 border-[#454545] hover:duration-300
					    duration-300 lg:gap-y-2 py-4 p-2 rounded-[8px] justify-between"
          >
            <div className="flex items-start lg:items-center gap-x-2">
              <Typography
                title="Типа теги, чтобы было круто"
                className="text-black dark:text-white"
                size="xl"
              >
                Теги:
              </Typography>
              <div className="flex flex-wrap gap-2">
                <div
                  className="flex bg-white/10 items-center rounded-[8px] px-2 text-xs md:text-base lg:text-md transition-colors"
                >
                  #правила
                </div>
                <div
                  className="flex bg-white/10 items-center rounded-[8px] px-2 text-xs md:text-base lg:text-md transition-colors"
                >
                  #база
                </div>
                <div
                  className="flex bg-white/10 items-center rounded-[8px] px-2 text-xs md:text-base lg:text-md transition-colors"
                >
                  #кодекс
                </div>
                <div
                  className="flex bg-white/10 items-center rounded-[8px] px-2 text-xs md:text-base lg:text-md transition-colors"
                >
                  #никтонечитает
                </div>
              </div>
            </div>
          </div>
          <RulesList />
        </div>
      </div>
    </MainLayoutPage>
  );
}