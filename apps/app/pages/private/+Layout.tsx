import { MainWrapperPage } from "@/shared/components/config/wrapper";
import { ReactNode } from "react"

const Navigation = () => {
  return (
    <>

    </>
  )
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <MainWrapperPage>
      <Navigation />
      {children}
    </MainWrapperPage>
  )
}