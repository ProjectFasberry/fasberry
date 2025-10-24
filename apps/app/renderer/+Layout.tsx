import { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="responsive mx-auto min-h-dvh">
      {children}
    </div>
  )
}