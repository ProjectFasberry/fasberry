import { usePageContext } from "vike-react/usePageContext"

export default function PlayerPage() {
  const nickname = usePageContext().routeParams.nickname

  return (
    <div>
      page for {nickname}
    </div>
  )
}