import { PageContextServer } from "vike/types";
import { useConfig } from 'vike-react/useConfig'
import { wrapTitle } from "@/shared/lib/wrap-title";
import { getStaticImage } from "@/shared/lib/volume-helpers";
import { logRouting } from "@/shared/lib/log";

const previewImage = getStaticImage("arts/adventure-in-blossom.jpg")

export async function data(pageContext: PageContextServer) {
  logRouting(pageContext.urlPathname, "data");
  
  const config = useConfig()
  
  config({
    title: wrapTitle("Главная"),
    image: previewImage,
  })
}