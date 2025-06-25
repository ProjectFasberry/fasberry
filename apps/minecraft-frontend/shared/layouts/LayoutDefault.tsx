import "@/pages/tailwind.css";

import "@/pages/minecraft-theme.css"
import "@/pages/minecraft-weather.css"

import { Header } from "./header";
import { ReatomProvider } from "./reatom-provider";
import { Footer } from "./footer";
import { Toaster } from "@/shared/components/config/toaster";
import { PropsWithChildren } from "react";

export default function LayoutDefault({ children }: PropsWithChildren) {
  return (
    <div id="page-container" className="bg-neutral-900">
      <ReatomProvider>
        <Toaster />
        <Header />
        <div id="page-content">
          {children}
        </div>
        <Footer />
      </ReatomProvider>
    </div>
  );
}