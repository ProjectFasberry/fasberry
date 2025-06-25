import "@/pages/tailwind.css";

import "@/pages/minecraft-theme.css"
import "@/pages/minecraft-weather.css"
import '@bprogress/core/css';

import { Header } from "./header";
import { ReatomProvider } from "./reatom-provider";
import { Footer } from "./footer";
import { Toaster } from "@/shared/components/config/toaster";
import { PropsWithChildren } from "react";
import { atom } from "@reatom/core";
import { PageContext } from "vike/types";
import { usePageContext } from "vike-react/usePageContext";
import { useUpdate } from "@reatom/npm-react";
import '@bprogress/core/css';

export const pageContextAtom = atom<PageContext | null>(null, "pageContext")
export const pageSearchParams = atom<Record<string, string>>({}, "pageSearchParams")

pageContextAtom.onChange((ctx, state) => console.log("pageContextAtom", state))

pageContextAtom.onChange((ctx, target) => {
  if (target) {
    pageSearchParams(ctx, target.urlParsed.search)
  }
})

const SyncPageContext = () => {
  const pageContext = usePageContext()
  useUpdate((ctx) => pageContextAtom(ctx, pageContext), [])
  return null;
}

export default function LayoutDefault({ children }: PropsWithChildren) {
  return (
    <div id="page-container" className="bg-neutral-900">
      <ReatomProvider>
        <Toaster />
        <SyncPageContext />
        <Header />
        <div id="page-content">
          {children}
        </div>
        <Footer />
      </ReatomProvider>
    </div>
  );
}