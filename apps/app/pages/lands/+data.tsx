import { PageContextServer } from "vike/types";
import { useConfig } from 'vike-react/useConfig'

export async function data(pageContext: PageContextServer) {
  const config = useConfig()

  config({
    Head: (
      <>
        <meta name="description" content="Территории сервера" />
      </>
    )
  })
}