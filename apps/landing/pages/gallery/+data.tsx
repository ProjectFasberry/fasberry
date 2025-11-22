import { LANDING_ENDPOINT } from '@/shared/env';
import { wrapTitle } from '@/shared/lib/wrap-title';
import { useConfig } from 'vike-react/useConfig';
import { PageContextServer } from 'vike/types';

export const data = async (pageContext: PageContextServer) => {
  const config = useConfig()

  const url = `${LANDING_ENDPOINT}${pageContext.urlPathname}`

  config({
    title: wrapTitle("Галерея"),
    Head: (
      <>
        <link rel="canonical" href={url} />
        <meta property="og:url" content={url} />
      </>
    )
  })
}