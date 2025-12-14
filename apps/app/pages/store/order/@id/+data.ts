import { PageContextServer } from "vike/types";
import { useConfig } from 'vike-react/useConfig'
import { logRouting } from "@/shared/lib/log";
import { getOrder } from "@/shared/components/app/shop/models/store-order.model";
import { render } from "vike/abort";
import { OrderSingle, OrderSinglePayload } from "@repo/shared/types/entities/store";

export type Data = Awaited<ReturnType<typeof data>>;

function metadata(order: OrderSingle) {
  return {
    title: `Заказ ${order.unique_id}`
  }
}

export async function data(pageContext: PageContextServer) {
  logRouting(pageContext.urlPathname, "data")
  
  const config = useConfig()
  const headers = pageContext.headers ?? undefined
  const type = pageContext.urlParsed.search["type"];

  let order: OrderSinglePayload | null = null;

  try {
    order = await getOrder(pageContext.routeParams.id, { headers }, type)
  } catch {}

  if (!order) {
    throw render("/not-exist")
  }

  config(metadata(order))

  return {
    data: order
  }
}