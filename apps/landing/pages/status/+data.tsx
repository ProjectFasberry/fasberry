import { useConfig } from 'vike-react/useConfig';
import { PageContextServer } from 'vike/types';
import { LANDING_ENDPOINT } from '@/shared/env';
import { wrapTitle } from '@/shared/lib/wrap-title';

export const data = async (pageContext: PageContextServer) => {
  const config = useConfig()

  const url = `${LANDING_ENDPOINT}${pageContext.urlPathname}`

  config({
    title: wrapTitle(`Статус сервера`),
    Head: (
      <>
        <link rel="canonical" href={url} />
        <meta property="og:url" content={url} />
      </>
    )
  })
}