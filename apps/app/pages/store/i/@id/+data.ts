import { PageContextServer } from "vike/types";
import { useConfig } from 'vike-react/useConfig'
import { wrapTitle } from "@/shared/lib/wrap-title";
import { client } from "@/shared/api/client";
import { render } from "vike/abort";
import { StoreItem } from "@repo/shared/types/entities/store";
import logger from "consola"
import { defineCartData } from "@/shared/components/app/shop/models/store-cart.model";

export type Data = Awaited<ReturnType<typeof data>>;

async function getItem({ id, ...args }: { id: string } & RequestInit) {
  const res = await client(`store/item/${id}`, { throwHttpErrors: false, ...args })
  const data = await res.json<WrappedResponse<StoreItem>>()

  if ("error" in data) {
    return null;
  }

  return data.data
}

export function logRouting(t: string, m: string) {
  logger.log(`[Routing]: ${t} called +${m}`)
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

  logRouting(pageContext.urlPathname, "data")

  await defineCartData(pageContext)

  return {
    id: pageContext.routeParams.id,
    item
  }
}