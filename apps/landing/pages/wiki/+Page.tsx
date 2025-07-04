import { WikiContent, wikiParamAtom } from "@/shared/components/landing/wiki/content/wiki-content";
import { WikiNavigationBar } from "@/shared/components/landing/wiki/sidebar/wiki-navigation-bar";
import { reatomComponent } from "@reatom/npm-react";
import { MainWrapperPage } from "@repo/ui/main-wrapper";
import { Tabs } from "@repo/ui/tabs";
import { clientOnly } from "vike-react/clientOnly";

const WikiNavigationMobile = clientOnly(() => import("@/shared/components/landing/wiki/sidebar/wiki-navigation-mobile").then(m => m.WikiNavigationMobile))

const Wiki = reatomComponent(({ctx}) => {
  return (
    <Tabs
      defaultValue="general"
      value={ctx.spy(wikiParamAtom)}
      onValueChange={v => wikiParamAtom(ctx, v)}
      className="flex flex-col lg:flex-row items-start justify-between bg-transparent w-full gap-x-4"
    >
      <WikiNavigationBar />
      <WikiContent />
      <WikiNavigationMobile />
    </Tabs>
  )
}, "Wiki")

export default function WikiPage() {
  return (
    <MainWrapperPage>
      <Wiki/>
    </MainWrapperPage>
  )
}