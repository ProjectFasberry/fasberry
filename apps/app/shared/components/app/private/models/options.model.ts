import { client, withJsonBody } from "@/shared/lib/client-wrapper";
import { logError } from "@/shared/lib/log";
import { reatomAsync, withCache, withStatusesAtom } from "@reatom/async";
import { reatomMap } from "@reatom/framework";
import { notifyAboutRestrictRole } from "./actions.model";

export type Option = {
  title: string,
  name: string,
  value: boolean
}

export const optionsAtom = reatomMap<string, Option>();

export const updateOptionAction = reatomAsync(async (ctx, name: Option["name"], value: Option["value"]) => {
  const json = { value }

  const result = await ctx.schedule(() =>
    client
      .post<Pick<Option, "value">>(`privated/options/${name}/edit`,)
      .pipe(withJsonBody(json))
      .exec()
  )

  return { name, result }
}, {
  name: "updateOptionAction",
  onFulfill: (ctx, { name, result }) => {
    const option = optionsAtom.get(ctx, name)
    if (!option) return;

    optionsAtom.set(ctx, name, { ...option, value: result.value })
  },
  onReject: (ctx, e) => {
    notifyAboutRestrictRole(e)
    logError(e)
  }
}).pipe(withStatusesAtom())

export const optionsAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(() =>
    client<Option[]>("privated/options/list").exec()
  )
}, {
  name: "optionsAction",
  onFulfill: (ctx, res) => {
    const options = new Map(res.map(option => [option.name, option]));
    optionsAtom(ctx, options)
  },
  onReject: (ctx, e) => {
    notifyAboutRestrictRole(e)
    logError(e)
  }
}).pipe(withStatusesAtom(), withCache({ swr: false }))