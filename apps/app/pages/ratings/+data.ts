import { useConfig } from 'vike-react/useConfig'
import { wrapTitle } from '@/shared/lib/wrap-title'
import { getStaticImage } from '@/shared/lib/volume-helpers'
import { logRouting } from '../store/i/@id/+data'
import { PageContextServer } from 'vike/types'

export const data = async (pageContext: PageContextServer) => {
  const config = useConfig()

  logRouting(pageContext.urlPathname, "data")

  config({
    title: wrapTitle(`Рейтинг игроков`),
    image: getStaticImage("arts/adventure-in-blossom.jpg"),
  })
}