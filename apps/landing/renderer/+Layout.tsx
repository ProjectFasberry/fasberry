import '@bprogress/core/css';
import "@/shared/styles/tailwind.css";
import "@/shared/styles/minecraft.css"

import { Toaster } from "@/shared/components/config/toaster";
import { PropsWithChildren } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { useUpdate } from "@reatom/npm-react";
import { pageContextAtom } from '@/shared/models/global.model';
import { ReatomProvider } from '@/shared/components/landing/layouts/reatom-provider';
import { Footer } from '@/shared/components/landing/layouts/footer';
import { Header } from '@/shared/components/landing/layouts/header';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"

const SyncPageContext = () => {
  const pageContext = usePageContext()
  useUpdate((ctx) => pageContextAtom(ctx, pageContext), [])
  return null;
}

export default function LayoutDefault({ children }: PropsWithChildren) {
  return (
    <div id="page-container">
      <Analytics />
      <SpeedInsights />
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