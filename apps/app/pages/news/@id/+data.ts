import { logRouting } from "@/pages/store/i/@id/+data";
import { client } from "@/shared/api/client";
import { NewsType } from "@/shared/components/app/news/components/news";
import { wrapTitle } from "@/shared/lib/wrap-title";
import { useConfig } from "vike-react/useConfig";
import { render } from "vike/abort";
import { PageContextServer } from "vike/types";

export type Data = Awaited<ReturnType<typeof data>>;

async function getNews({ id, ...args }: { id: string } & RequestInit) {
  const res = await client(`shared/news/${id}`, { ...args })
  const data = await res.json<WrappedResponse<NewsType>>()

  if (!data || 'error' in data) return null

  return data.data
}

export async function data(pageContext: PageContextServer) {
  const config = useConfig()

  let news: NewsType | null = null;

  try {
    news = await getNews({ 
      id: pageContext.routeParams.id, headers: pageContext.headers ?? undefined 
    })
  } catch (e) {
    console.error(e)
  }

  if (!news) {
    throw render("/not-exist")
  }

  config({
    title: wrapTitle(news.title),
    description: news.description.slice(0, 256)
  })

  logRouting(pageContext.urlPathname, "data");

  return {
    id: pageContext.routeParams.id,
    news
  }
}