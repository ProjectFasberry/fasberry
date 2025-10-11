import { PageContextServer } from "vike/types";
import { useConfig } from 'vike-react/useConfig'
import { wrapTitle } from "@/shared/lib/wrap-title";
import { render } from "vike/abort";
import { StoreItem } from "@repo/shared/types/entities/store";
import { defineCartData } from "@/shared/components/app/shop/models/store-cart.model";
import { logRouting } from "@/shared/lib/log";
import { getStoreItem } from "@/shared/components/app/shop/models/store-item.model";

export type Data = Awaited<ReturnType<typeof data>>;

function metadata(
  item: StoreItem,
  pageContext: PageContextServer
) {
  const title = wrapTitle(item.title).slice(0, 64)
  const description = item.summary;
  const image = item.imageUrl
  const keywords = `${item.title}, fasberry, fasberry page, товар, магазин, store`

  return {
    title,
    description,
    image,
    Head: (
      <>
        <meta property="og:url" content={pageContext.urlPathname} />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <link rel="preload" as="image" href={image} imageSrcSet="" imageSizes="" />
        <meta name="keywords" content={keywords} />
      </>
    ),
  }
}

export async function data(pageContext: PageContextServer) {
  logRouting(pageContext.urlPathname, "data")

  const config = useConfig()
  const headers = pageContext.headers ?? undefined

  let item: StoreItem | null =null

  try {
    item = await getStoreItem(pageContext.routeParams.id, { headers })
  } catch {}

  if (!item) {
    throw render("/not-exist?type=store-item")
  }

  config(metadata(item, pageContext))

  await defineCartData(pageContext)

  return {
    id: pageContext.routeParams.id,
    data: item
  }
}