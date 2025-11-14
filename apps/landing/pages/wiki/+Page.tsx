import { pageContextAtom } from "@/shared/api/global.model";
import { WikiContentItem, WikiContentItemSkeleton } from "@/shared/components/landing/wiki/components/wiki-content";
import { WikiNavigation } from "@/shared/components/landing/wiki/components/wiki-navigation-bar";
import { wikiCategoriesNodesAtom, wikiCategoriesAction, wikiParamAtom, wikiAction } from "@/shared/components/landing/wiki/models/wiki.model";
import { action } from "@reatom/core";
import { reatomComponent, useUpdate } from "@reatom/npm-react";
import { MainWrapperPage } from "@repo/ui/main-wrapper";
import { Tabs, TabsContent, TabsContents } from "@repo/ui/tabs";
import { navigate } from "vike/client/router";

const WikiContent = reatomComponent(({ ctx }) => {
  const data = ctx.spy(wikiCategoriesNodesAtom)

  if (ctx.spy(wikiCategoriesAction.statusesAtom).isPending) {
    return <WikiContentItemSkeleton />
  }

  return data.map(con => (
    <TabsContent key={con.value} value={con.value}>
      <WikiContentItem category={con.value} />
    </TabsContent>
  ))
}, "WikiContent")

const Wiki = reatomComponent(({ ctx }) => {
  return (
    <Tabs
      value={ctx.spy(wikiParamAtom)}
      onValueChange={v => wikiParamAtom(ctx, v)}
      activationMode="manual"
      className="flex flex-col lg:flex-row items-start justify-between bg-transparent w-full gap-x-4"
    >
      <WikiNavigation />
      <div className="flex flex-col xl:w-[75%] w-full overflow-hidden lg:w-auto">
        <TabsContents>
          <WikiContent />
        </TabsContents>
      </div>
    </Tabs>
  )
}, "Wiki")

const events = action((ctx) => {
  const pageContext = ctx.get(pageContextAtom)
  if (!pageContext) return;

  wikiCategoriesAction(ctx)

  const search = pageContext.urlParsed.search
  const tab = search["tab"] ?? "general"

  wikiAction(ctx, tab);

  if (!tab) {
    navigate(`/wiki?tab=${tab}`)
    return;
  }

  wikiParamAtom(ctx, tab);
})

export default function Page() {
  useUpdate(events, [pageContextAtom])

  return (
    <MainWrapperPage>
      <Wiki />
    </MainWrapperPage>
  )
}
