import { PageContextServer } from "vike/types";
import { useConfig } from 'vike-react/useConfig'
import Asset from "@repo/assets/images/adventure-in-blossom.jpg"

export async function data(pageContext: PageContextServer) {
  const config = useConfig()

  config({
    title: `Рейтинг игроков`,
    image: Asset
  })

  
}