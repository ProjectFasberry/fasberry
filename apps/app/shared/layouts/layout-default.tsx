import '@bprogress/core/css';
import "@/pages/tailwind.css";

import { Header } from "./header";
import { ReatomProvider } from "./reatom-provider";
import { PropsWithChildren } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { useUpdate } from "@reatom/npm-react";
import { Toaster } from "./toaster";
import { pageContextAtom } from "../api/global.model";

const SyncPageContext = () => {
  const pageContext = usePageContext()
  useUpdate((ctx) => pageContextAtom(ctx, pageContext), [pageContext])
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
      </ReatomProvider>
    </div>
  );
}