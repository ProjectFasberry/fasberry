import { pageContextAtom } from "@/shared/models/global.model"
import { Land } from "@/shared/components/app/land/components/land"
import { landAtom } from "@/shared/components/app/land/models/land.model"
import { MainWrapperPage } from "@/shared/components/config/wrapper";
import { Data } from "./+data"
import { action } from "@reatom/core";
import { useUpdate } from "@reatom/npm-react";
import { startPageEvents } from "@/shared/lib/events";

const events = action((ctx) => {
  const pageContext = ctx.get(pageContextAtom)
  if (!pageContext) return;

  const data = pageContext.data as Data

  landAtom(ctx, data.land)
}, "events")

export default function Page() {
  useUpdate((ctx) => startPageEvents(ctx, events, { urlTarget: "land" }), [pageContextAtom]);

  return (
    <MainWrapperPage>
      <Land />
    </MainWrapperPage>
  )
}