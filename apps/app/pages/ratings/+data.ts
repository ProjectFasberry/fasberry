import { useConfig } from 'vike-react/useConfig'
import { wrapTitle } from '@/shared/lib/wrap-title'
import { getStaticImage } from '@/shared/lib/volume-helpers'
import { PageContextServer } from 'vike/types'
import { logRouting } from '@/shared/lib/log'

const previewImage = getStaticImage("arts/adventure-in-blossom.jpg")

export const data = async (pageContext: PageContextServer) => {
  logRouting(pageContext.urlPathname, "data");

  const config = useConfig()

  config({
    title: wrapTitle(`Рейтинг игроков`),
    image: previewImage,
  })
}