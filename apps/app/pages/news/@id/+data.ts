import { News } from "@/pages/index/+Page";
import { BASE } from "@/shared/api/client";
import { PageContextServer } from "vike/types";

export type Data = Awaited<ReturnType<typeof data>>;

async function getNews(id: string) {
  const res = await BASE(`shared/news/${id}`)
  const data = await res.json<{ data: News } | { error: string }>()

  if (!data || 'error' in data) return null

  return data.data
}

export async function data(pageContext: PageContextServer) {
  let news: News | null = null;

  try {
    news = await getNews(pageContext.routeParams.id)
  } catch (e) {
    console.error(e)
  }

  return {
    id: pageContext.routeParams.id,
    news
  }
}