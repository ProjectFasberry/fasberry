import { wrapTitle } from "@/shared/lib/wrap-title";

export default function RatingsHead() {
  return (
    <>
      <title>{wrapTitle("Рейтинг игроков")}</title>
      <meta name="description" content="Рейтинг игроков" />
      <link rel="canonical" href={`/ratings`} />
      <meta property="og:description" content="Рейтинг игроков" />
      <meta property="og:url" content={`/ratings`} />
    </>
  )
}