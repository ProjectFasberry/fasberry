import { WrapperTitle } from '@repo/landing-ui/src/wrapper-title';
import { Overlay } from '@repo/landing-ui/src/overlay';
import { MainLayoutPage } from "#components/layout/default/main-layout";
import { Typography } from '@repo/landing-ui/src/typography';
import Link from 'next/link';
import { Button } from '@repo/landing-ui/src/button';
import { Shop } from '#components/shop/shop';
import { MINECRAFT_SITE_DOMAIN } from '@repo/shared/constants/origin-list';

export const metadata = {
  title: 'Магазин',
  description:
    'Поддержите наш сервер Fasberry, приобретая привилегии, уникальные товары и игровые монеты. Улучшите свой игровой опыт и помогите развитию проекта!',
  keywords: [
    'Fasberry магазин',
    'купить привилегии Fasberry',
    'игровые товары Fasberry',
    'монеты Fasberry',
    'донат магазин Fasberry',
    'поддержка сервера Fasberry',
  ],
  author: 'Fasberry Server Team',
  robots: 'index, follow',
  canonical: `${MINECRAFT_SITE_DOMAIN}/shop`,
  openGraph: {
    siteName: 'Магазин Fasberry',
    title: 'Магазин | Fasberry',
    description:
      'Получите доступ к уникальным привилегиям, товарам и монетам на нашем сервере. Ваша поддержка помогает проекту развиваться!',
    url: `${MINECRAFT_SITE_DOMAIN}/shop`,
    type: 'website',
    images: [
      {
        url: 'https://mc.fasberry.su/images/community/market-seller.webp',
        alt: "Магазин",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Магазин | Fasberry',
    description:
      'Поддержите наш сервер Fasberry, приобретая уникальные привилегии и товары. Сделайте свой игровой процесс незабываемым!',
    images: ['https://mc.fasberry.su/images/community/market-seller.webp'],
  },
};

export default async function DonatePage() {
  return (
    <MainLayoutPage variant="with_section">
      <div
        className="full-screen-section h-[80vh] lg:min-h-screen flex items-center justify-start bg-bottom md:bg-center overflow-hidden bg-no-repeat bg-cover
					bg-[url('/images/backgrounds/donate_background.png')]"
      >
        <Overlay variant="default" />
        <WrapperTitle>
          <div className="flex flex-col gap-6 items-start justify-center w-full lg:max-w-3xl">
            <div className="flex flex-col gap-1 w-full lg:max-w-3xl">
              <Typography position="left" className="text-5xl lg:text-6xl text-gold mb-2">
                Магазин
              </Typography>
              <Typography position="left" text_color="white" className="text-2xl md:text-3xl">
                Здесь можно купить привилегии, игровую валюту или ивент.
              </Typography>
            </div>
            <Link href="#shop-list">
              <Button
                size="default"
                variant="pageLink"
                className="hover:bg-[#8c1c85] rounded-xl border border-[#8c1c85] bg-[#731c6c]"
              >
                <Typography text_color="white" className="font-bold text-xl">
                  <span
                    className="inline-block group-hover:rotate-0 rotate-90 duration-150 group-hover:duration-150"
                  >
                    ⭐
                  </span>
                  &nbsp;К товарам
                </Typography>
              </Button>
            </Link>
          </div>
        </WrapperTitle>
      </div>
      <div className="full-screen-section flex flex-col min-h-screen items-center">
        <div
          id="shop-list"
          className="flex flex-col py-32 responsive mx-auto"
        >
          <div className="flex flex-col items-center justify-center mb-6">
            <Typography text_color="black" position="center" variant="block_title">
              Доступные товары
            </Typography>
            {/* <Typography size="xl" position="center" className="text-dark-red dark:text-gold">
              привилегии и всё, что с ними связано
            </Typography> */}
          </div>
          <Shop />
        </div>
      </div>
    </MainLayoutPage>
  );
}