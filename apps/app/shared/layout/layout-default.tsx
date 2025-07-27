import '@bprogress/core/css';
import "@/shared/styles/tailwind.css";

import { Header } from "./header";
import { ReatomProvider } from "./reatom-provider";
import { PropsWithChildren } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { useUpdate } from "@reatom/npm-react";
import { pageContextAtom } from "../models/global.model";
import { Footer } from './footer';
import { Widgets } from '../components/app/widgets/components/widgets';
import { Toaster } from '../components/config/toaster';

const SyncPageContext = () => {
  const pageContext = usePageContext()
  useUpdate((ctx) => pageContextAtom(ctx, pageContext), [pageContext])
  return null;
}

export default function LayoutDefault({ children }: PropsWithChildren) {
  return (
    <ReatomProvider>
      <SyncPageContext />
      <Toaster />
      <div id="page-container">
        <Header />
        <div id="page-content">
          {children}
          <Footer />
        </div>
        <Widgets />
      </div>
    </ReatomProvider>
  );
}