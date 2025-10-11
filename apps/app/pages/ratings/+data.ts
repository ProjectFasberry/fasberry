import { useConfig } from 'vike-react/useConfig'
import { wrapTitle } from '@/shared/lib/wrap-title'
import { getStaticImage } from '@/shared/lib/volume-helpers'
import { PageContextServer } from 'vike/types'
import { logRouting } from '@/shared/lib/log'

const title = wrapTitle(`Рейтинг игроков`)
const previewImage = getStaticImage("arts/adventure-in-blossom.jpg")

function metadata() {
  return {
    title,
    description: "Актуальный рейтинг игроков в разных категориях",
    image: previewImage,
  }
}

export const data = async (pageContext: PageContextServer) => {
  logRouting(pageContext.urlPathname, "data");

  const config = useConfig()

  config(metadata())
}