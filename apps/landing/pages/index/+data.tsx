import { useConfig } from 'vike-react/useConfig';
import { PageContextServer } from 'vike/types';
import { LANDING_ENDPOINT } from '@/shared/env';
import { wrapTitle } from '@/shared/lib/wrap-title';

export const data = async (ctx: PageContextServer) => {
  const config = useConfig()

  config({
    title: wrapTitle(`Главная`),
    Head: (
      <>
        <link rel="canonical" href={`${LANDING_ENDPOINT}${ctx.urlPathname}`} />
        <meta property="og:url" content={LANDING_ENDPOINT} />
      </>
    )
  })
}