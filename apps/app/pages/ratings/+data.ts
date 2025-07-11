import { useConfig } from 'vike-react/useConfig'
import { wrapTitle } from '@/shared/lib/wrap-title'
import { getStaticImage } from '@/shared/lib/volume-helpers'

export async function data() {
  const config = useConfig()

  config({
    title: wrapTitle(`Рейтинг игроков`),
    image: getStaticImage("arts/adventure-in-blossom.jpg"),
  })
}