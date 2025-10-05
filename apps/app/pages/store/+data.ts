import { defineCartData, defineStoreItemsData } from "@/shared/components/app/shop/models/store-cart.model";
import { logRouting } from "@/shared/lib/log";
import { PageContextServer } from "vike/types";

export const data = async (pageContext: PageContextServer) => {
  logRouting(pageContext.urlPathname, "data")

  await defineStoreItemsData(pageContext)
  await defineCartData(pageContext)
}