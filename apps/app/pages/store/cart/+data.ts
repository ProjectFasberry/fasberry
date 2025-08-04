import { defineCartData } from "@/shared/components/app/shop/models/store-cart.model";
import { PageContextServer } from "vike/types";
import { logRouting } from "../i/@id/+data";

export const data = async (pageContext: PageContextServer) => {
  logRouting(pageContext.urlPathname, "data")

  await defineCartData(pageContext)
}