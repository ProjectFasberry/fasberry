// import { RatingList } from "#components/ratings/components/rating-list"
// import { RatingNavigation } from "#components/ratings/components/rating-navigation"
// import { wrapTitle } from "@repo/lib/utils/wrap-title"
// import { FORUM_SITE_DOMAIN } from "@repo/shared/constants/origin-list"
// import { Head } from "@unhead/react"

// const RatingsHead = () => {
//   return (
//     <Head>
//       <title>{wrapTitle("Рейтинг игроков")}</title>
//       <meta name="description" content="Рейтинг игроков" />
//       <link rel="canonical" href={`${FORUM_SITE_DOMAIN}/ratings`} />
//       <meta property="og:description" content="Рейтинг игроков" />
//       <meta property="og:url" content={`${FORUM_SITE_DOMAIN}/ratings`} />
//     </Head>
//   )
// }

// export function RatingsRouteComponent() {
//   return (
//     <div className="flex flex-col w-full gap-4 items-center justify-center h-full relative">
//       <RatingsHead />
//       <RatingNavigation />
//       <div className="flex w-full bg-primary-color p-2 rounded-lg h-full">
//         <RatingList />
//       </div>
//     </div>
//   )
// }