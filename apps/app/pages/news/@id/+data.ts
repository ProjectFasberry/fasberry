import { client } from "@/shared/api/client";
import { logRouting } from "@/shared/lib/log";
import { wrapTitle } from "@/shared/lib/wrap-title";
import { News } from "@repo/shared/types/entities/news";
import { useConfig } from "vike-react/useConfig";
import { render } from "vike/abort";
import { PageContextServer } from "vike/types";

export type Data = Awaited<ReturnType<typeof data>>;

async function getNews(id: string, init: RequestInit) {
  const res = await client(`shared/news/${id}`, { ...init })
  const data = await res.json<WrappedResponse<News>>()
  if ('error' in data) throw new Error(data.error)
  return data.data
}

function metadata(
  news: News
) {
  return {
    title: wrapTitle(news.title),
    description: news.description.slice(0, 256)
  }
}

export async function data(pageContext: PageContextServer) {
  logRouting(pageContext.urlPathname, "data");

  const config = useConfig()
  const headers = pageContext.headers ?? undefined;
  
  const news = await getNews(pageContext.routeParams.id, { headers })

  if (!news) {
    throw render("/not-exist")
  }

  config(metadata(news))

  return {
    id: pageContext.routeParams.id,
    data: news
  }
}