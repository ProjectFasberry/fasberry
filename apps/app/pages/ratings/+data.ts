import { useConfig } from 'vike-react/useConfig'
import Asset from "@repo/assets/images/adventure-in-blossom.jpg"
import { wrapTitle } from '@/shared/lib/wrap-title'

export async function data() {
  const config = useConfig()

  config({
    title: wrapTitle(`Рейтинг игроков`),
    image: Asset
  })
}