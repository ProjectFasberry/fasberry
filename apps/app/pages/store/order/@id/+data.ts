import { PageContextServer } from "vike/types";
import { useConfig } from 'vike-react/useConfig'
import { wrapTitle } from "@/shared/lib/wrap-title";
import { client } from "@/shared/api/client";
import { Payment } from "@/shared/components/app/shop/models/store.model";
import { logRouting } from "../../i/@id/+data";

export type Data = Awaited<ReturnType<typeof data>>;

async function getOrder(
  id: string, 
  args: RequestInit
) {
  const res = await client(`store/order/${id}`, { throwHttpErrors: false, ...args })
  const data = await res.json<WrappedResponse<Payment>>()

  if ("error" in data) throw new Error(data.error)

  return data.data
}

export async function data(pageContext: PageContextServer) {
  const config = useConfig()
  const headers = pageContext.headers ?? undefined

  const item = await getOrder(pageContext.routeParams.id, { headers })

  let title = `Заказ ${item.unique_id}`
  
  if (!item) {
    title = wrapTitle(`Заказ устарел`)
  }

  config({
    title
  })

  logRouting(pageContext.urlPathname, "data")

  return {
    id: pageContext.routeParams.id,
    item
  }
}