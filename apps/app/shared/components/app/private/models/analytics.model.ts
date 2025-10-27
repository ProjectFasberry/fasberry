import { client, withAbort, withQueryParams } from "@/shared/lib/client-wrapper";
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async";
import { atom, Ctx } from "@reatom/core";

type ChartData = {
  label: string;
  registrations: number;
};

export const registrationsTypeAtom = atom<"day" | "month" | "hour">("day", "registrationsType")
const registrationsHourMin = atom(0)

function refetchRegistrations(ctx: Ctx) {
  registrationsChartsAction.cacheAtom.reset(ctx)
  registrationsChartsAction(ctx)
}

registrationsTypeAtom.onChange((ctx, state) => {
  refetchRegistrations(ctx)
})

export const registrationsChartsAction = reatomAsync(async (ctx) => {
  const type = ctx.get(registrationsTypeAtom);

  return await ctx.schedule(() =>
    client<ChartData[]>("privated/analytics/registrations")
      .pipe(withQueryParams({ type }), withAbort(ctx.controller.signal))
      .exec()
  )
}, "registrationsChartsAction").pipe(
  withDataAtom(null),
  withStatusesAtom(),
  withCache({ swr: false })
)