import { LANDING_ENDPOINT } from '@/shared/env';
import { wrapTitle } from '@/shared/lib/wrap-title';
import { useConfig } from 'vike-react/useConfig';
import { PageContextServer } from 'vike/types';

export const data = async (ctx: PageContextServer) => {
  const config = useConfig()

  config({
    title: wrapTitle("Галерея"),
    Head: (
      <>
        <link rel="canonical" href={`${LANDING_ENDPOINT}${ctx.urlPathname}`} />
        <meta property="og:url" content={`${LANDING_ENDPOINT}/gallery`} />
      </>
    )
  })
}