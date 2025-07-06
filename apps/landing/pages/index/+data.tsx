import { useConfig } from 'vike-react/useConfig';
import { PageContextServer } from 'vike/types';

export const data = async (ctx: PageContextServer) => {
  const config = useConfig()

  config({
    Head: (
      <>
        <link rel="canonical" href={`https://mc.fasberry.su${ctx.urlPathname}`} />
        <meta property="og:url" content="https://mc.fasberry.su" />
      </>
    )
  })
}