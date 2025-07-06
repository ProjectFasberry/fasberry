import { MainWrapperPage } from "@/shared/components/config/wrapper";
import { ReactNode } from "react"

const Navigation = () => {
  return (
    <>
    
    </>
  )
}

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return (
    <MainWrapperPage>
      <Navigation/>
      {children}
    </MainWrapperPage>
  )
}