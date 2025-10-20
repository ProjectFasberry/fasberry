import { useConfig } from 'vike-react/useConfig';
import { PageContextServer } from 'vike/types';
import { LANDING_ENDPOINT } from '@/shared/env';

export const data = async (ctx: PageContextServer) => {
  const config = useConfig()

  config({
    Head: (
      <>
        <link rel="canonical" href={`${LANDING_ENDPOINT}${ctx.urlPathname}`} />
        <meta property="og:url" content={`${LANDING_ENDPOINT}${ctx.urlPathname}`} />
      </>
    )
  })
}