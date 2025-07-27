import { PageContextServer } from "vike/types";
import { useConfig } from 'vike-react/useConfig'
import { wrapTitle } from "@/shared/lib/wrap-title";
import { client } from "@/shared/api/client";
import { Payment } from "@/shared/components/app/shop/models/store.model";

export type Data = Awaited<ReturnType<typeof data>>;

async function getOrder({ id, ...args }: { id: string } & RequestInit) {
  const res = await client(`store/order/${id}`, { throwHttpErrors: false, ...args })
  const data = await res.json<WrappedResponse<Payment>>()

  if ("error" in data) {
    return null;
  }

  return data.data
}

export async function data(pageContext: PageContextServer) {
  const config = useConfig()

  const item = await getOrder({ id: pageContext.routeParams.id, headers: pageContext.headers ?? undefined })

  if (item) {
    config({
      title: wrapTitle(`Заказ ${item.unique_id}`),
    })
  } else {
    config({
      title: wrapTitle(`Заказ устарел`),
    })
  }

  return {
    id: pageContext.routeParams.id,
    item
  }
}