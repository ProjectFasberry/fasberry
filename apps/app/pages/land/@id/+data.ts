import { BASE } from "@/shared/api/client";
import { Land } from "@/shared/components/app/land/models/land.model";
import { PageContextServer } from "vike/types";

export type Data = Awaited<ReturnType<typeof data>>;

async function getLand(id: string) {
  const res = await BASE(`server/land/${id}`)
  const data = await res.json<{ data: Land } | { error: string }>()

  if (!data || 'error' in data) return null

  return data.data
}

export async function data(pageContext: PageContextServer) {
  let land: Land | null = null;

  try {
    land = await getLand(pageContext.routeParams.id)
  } catch (e) {
    console.error(e)
  }

  return {
    id: pageContext.routeParams.id,
    land
  }
}