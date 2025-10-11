import { client } from "@/shared/lib/client-wrapper";
import { logRouting } from "@/shared/lib/log";
import { getStaticImage } from "@/shared/lib/volume-helpers";
import { wrapTitle } from "@/shared/lib/wrap-title";
import { News } from "@repo/shared/types/entities/news";
import { useConfig } from "vike-react/useConfig";
import { render } from "vike/abort";
import { PageContextServer } from "vike/types";

export type Data = Awaited<ReturnType<typeof data>>;

async function getNews(id: string, init: RequestInit) {
  return client<News>(`shared/news/${id}`, init).exec()
}

function metadata(
  news: News
) {
  return {
    title: wrapTitle(news.title),
    description: news.description.slice(0, 256),
    image: getStaticImage(news.imageUrl!.slice(1))
  }
}

export async function data(pageContext: PageContextServer) {
  logRouting(pageContext.urlPathname, "data");

  const config = useConfig()
  const headers = pageContext.headers ?? undefined;
  
  let news: News | null = null;

  try {
    news = await getNews(pageContext.routeParams.id, { headers })
  } catch {}

  if (!news) {
    throw render("/not-exist")
  }

  config(metadata(news))

  return {
    id: pageContext.routeParams.id,
    data: news
  }
}