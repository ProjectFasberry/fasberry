import { useConfig } from 'vike-react/useConfig';
import { PageContextServer } from 'vike/types';
import { LANDING_ENDPOINT } from '@/shared/env';
import { wrapTitle } from '@/shared/lib/wrap-title';
import { Wiki } from '@/shared/components/landing/wiki/models/wiki.model';
import { client } from '@/shared/api/client';

export type Data = Awaited<ReturnType<typeof data>>

async function getData(param: string, init: RequestInit) {
  const res = await client(`shared/wiki/category/${param}`, { ...init })
  const data = await res.json<{ data: Wiki } | { error: string }>()
  
  if ("error" in data) throw new Error(data.error)
  return data.data
}

export const data = async (pageContext: PageContextServer) => {
  const config = useConfig()
  const headers = pageContext.headers ?? undefined;
  const param = pageContext.routeParams.category;

  const url = `${LANDING_ENDPOINT}${pageContext.urlPathname}`

  const categoryResult = await getData(param, { headers })

  const title = wrapTitle(`Вики - ${categoryResult.title}`)

  config({
    title,
    Head: (
      <>
        <link rel="canonical" href={url} />
        <meta property="og:url" content={url} />
      </>
    )
  })

  return {
    param,
    data: categoryResult
  }
}