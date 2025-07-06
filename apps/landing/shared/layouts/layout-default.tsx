import '@bprogress/core/css';

import "@/pages/tailwind.css";
import "@/pages/minecraft.css"

import { Header } from "./header";
import { ReatomProvider } from "./reatom-provider";
import { Footer } from "./footer";
import { Toaster } from "@/shared/components/config/toaster";
import { PropsWithChildren } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { useUpdate } from "@reatom/npm-react";
import { pageContextAtom } from "../api/global.model";

const SyncPageContext = () => {
  const pageContext = usePageContext()
  useUpdate((ctx) => pageContextAtom(ctx, pageContext), [])
  return null;
}

export default function LayoutDefault({ children }: PropsWithChildren) {
  return (
    <div id="page-container">
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