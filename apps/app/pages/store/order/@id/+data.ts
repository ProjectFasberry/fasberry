import { PageContextServer } from "vike/types";
import { useConfig } from 'vike-react/useConfig'
import { logRouting } from "@/shared/lib/log";
import { getOrder } from "@/shared/components/app/shop/models/store-checkout.model";
import { Payment } from "@/shared/components/app/shop/models/store.model";

export type Data = Awaited<ReturnType<typeof data>>;

function metadata(order: Payment) {
  return {
    title: `Заказ ${order.unique_id}`
  }
}

export async function data(pageContext: PageContextServer) {
  logRouting(pageContext.urlPathname, "data")
  
  const config = useConfig()
  const headers = pageContext.headers ?? undefined

  const order = await getOrder(pageContext.routeParams.id, { headers })

  config(metadata(order))

  return {
    id: pageContext.routeParams.id,
    data: order
  }
}