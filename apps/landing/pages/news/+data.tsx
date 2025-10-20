import { useConfig } from 'vike-react/useConfig';
import { PageContextServer } from 'vike/types';
import { LANDING_ENDPOINT } from '@/shared/env';
import { wrapTitle } from '@/shared/lib/wrap-title';
import { getStaticObject } from '@/shared/lib/volume';

const bgImage = getStaticObject("background", "bees.jpg")

const description = "Последние новости и обновления с нашего сервера Fasberry. Узнайте о новых возможностях и ивентах!"

export const data = async (ctx: PageContextServer) => {
  const config = useConfig()

  config({
    title: wrapTitle(`Новости`),
    description,
    Head: (
      <>
        <link rel="canonical" href={`${LANDING_ENDPOINT}${ctx.urlPathname}`} />
        <meta property="og:url" content={`${LANDING_ENDPOINT}${ctx.urlPathname}`} />
        <meta property="og:title" content="Новости" />
        <meta property="og:description" content={description} />
        <meta property="og:locale" content="ru_RU" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Новости" />
        <meta property="og:image" content={bgImage} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:title" content="Новости" />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={bgImage} />
        <meta property="twitter:image:type" content="image/jpeg" />
        <meta property="twitter:image:width" content="1200" />
        <meta property="twitter:image:height" content="630" />
      </>
    )
  })
}