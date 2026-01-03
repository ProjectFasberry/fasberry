import { PageContextServer } from "vike/types";
import { useConfig } from 'vike-react/useConfig'
import { wrapTitle } from "@/shared/lib/wrap-title";
import { getStaticImage } from "@/shared/lib/volume-helpers";
import { logRouting } from "@/shared/lib/log";
import { PLAY_IP } from "@/shared/env";

const previewImage = getStaticImage("arts/8332de192322939.webp")

const title = wrapTitle("Главная")
const description = `Официальное приложение майнкрафт-проекта Fasberry. Жанр: RP, RPG, полу-ванила. 1.20.1+. Играть: ${PLAY_IP}.`

function metadata(pageContext: PageContextServer) {
  return {
    title,
    image: previewImage,
    description,
    Head: (
      <>
        <meta property="og:url" content={pageContext.urlPathname} />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow, noarchive" />
        <meta name="googlebot" content="index, follow, noimageindex, max-video-preview:-1, max-image-preview:large, max-snippet:-1" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
      </>
    ),
  }
}

export async function data(pageContext: PageContextServer) {
  logRouting(pageContext.urlPathname, "data");
  
  const config = useConfig()
  
  config(metadata(pageContext))
}