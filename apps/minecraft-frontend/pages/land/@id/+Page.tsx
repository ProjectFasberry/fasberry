import { usePageContext } from "vike-react/usePageContext"

// import { Land } from '#components/land/components/land'

// export function LandRouteComponent() {
//   return (
//     <div className="flex items-start gap-4 w-full h-screen">
//       <Land />
//     </div>
//   )
// }

export default function LandPage() {
  const id = usePageContext().routeParams.id

  return (
    <div>
      page for {id}
    </div>
  )
}