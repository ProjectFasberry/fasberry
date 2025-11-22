import { usePageContext } from "vike-react/usePageContext"

export default function Page() {
  const id = usePageContext().routeParams.id;
  console.log(id);
  
  return (
    <>
    </>
  )
}