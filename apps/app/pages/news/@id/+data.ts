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

  if ('error' in data) throw new Error(data.error)

  return data.data
}

function metadata(
  news: NewsType
) {
  return {
    title: wrapTitle(news.title),
    description: news.description.slice(0, 256)
  }
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

  config(metadata(news))

  logRouting(pageContext.urlPathname, "data");

  return {
    id: pageContext.routeParams.id,
    news
  }
}