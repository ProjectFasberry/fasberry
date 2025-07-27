import { PageContextServer } from "vike/types";
import { useConfig } from 'vike-react/useConfig'
import { wrapTitle } from "@/shared/lib/wrap-title";
import { client } from "@/shared/api/client";
import { render } from "vike/abort";
import { StoreItem } from "@repo/shared/types/entities/store";

export type Data = Awaited<ReturnType<typeof data>>;

async function getItem({ id, ...args }: { id: string } & RequestInit) {
  const res = await client(`store/item/${id}`, { throwHttpErrors: false, ...args })
  const data = await res.json<WrappedResponse<StoreItem>>()

  if ("error" in data) {
    return null;
  }

  return data.data
}

export async function data(pageContext: PageContextServer) {
  const config = useConfig()

  const item = await getItem({ id: pageContext.routeParams.id, headers: pageContext.headers ?? undefined })

  if (!item) {
    throw render("/not-exist")
  }

  config({
    title: wrapTitle(item.title.slice(0, 32)),
  })

  return {
    id: pageContext.routeParams.id,
    item
  }
}