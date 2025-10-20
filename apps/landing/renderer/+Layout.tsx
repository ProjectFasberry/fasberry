import '@bprogress/core/css';
import "@/shared/styles/tailwind.css";
import "@/shared/styles/minecraft.css"

import { Toaster } from "@/shared/components/config/toaster";
import { PropsWithChildren } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { useUpdate } from "@reatom/npm-react";
import { ReatomProvider } from '@/shared/layouts/reatom-provider';
import { pageContextAtom } from '@/shared/api/global.model';
import { Header } from '@/shared/layouts/header';
import { Footer } from '@/shared/layouts/footer';

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