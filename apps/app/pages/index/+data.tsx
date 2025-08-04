import { PageContextServer } from "vike/types";
import { useConfig } from 'vike-react/useConfig'
import { wrapTitle } from "@/shared/lib/wrap-title";
import { getStaticImage } from "@/shared/lib/volume-helpers";
import { logRouting } from "../store/i/@id/+data";

export async function data(pageContext: PageContextServer) {
  const config = useConfig()

  logRouting(pageContext.urlPathname, "data");
  
  config({
    title: wrapTitle("Главная"),
    image: getStaticImage("arts/adventure-in-blossom.jpg"),
  })
}