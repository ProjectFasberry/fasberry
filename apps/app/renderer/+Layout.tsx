import '@bprogress/core/css';
import "@/shared/styles/tailwind.css";

import { ReatomProvider } from '@/shared/layout/reatom-provider';
import { usePageContext } from 'vike-react/usePageContext';
import { initClientGlobalModels } from '@/shared/models/page-context.model';
import { useUpdate } from '@reatom/npm-react';
import { PropsWithChildren } from 'react';
import { Footer } from '@/shared/layout/footer';
import { Toaster } from 'sonner';
import { Header } from '@/shared/layout/header';
import { Widgets } from '@/shared/components/app/widgets/components/widgets';
import { Banner } from '@/shared/components/app/widgets/components/banner';

const SyncPageContext = () => {
  const pageContext = usePageContext()
  useUpdate((ctx) => initClientGlobalModels(ctx, pageContext), [pageContext])
  return null;
}

export default function Layout({ children }: PropsWithChildren) {
  return (
    <ReatomProvider>
      <SyncPageContext />
      <Toaster />
      <div id="page-container">
        <Banner />
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