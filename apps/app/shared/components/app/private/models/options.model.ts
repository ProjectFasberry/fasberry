import { client, withJsonBody } from "@/shared/lib/client-wrapper";
import { logError } from "@/shared/lib/log";
import { reatomAsync, withCache, withStatusesAtom } from "@reatom/async";
import { reatomMap } from "@reatom/framework";

type Option = {
  title: string,
  name: string,
  value: boolean
}

export const optionsAtom = reatomMap<string, Option>();

export const updateOptionAction = reatomAsync(async (ctx, name: Option["name"], value: Option["value"]) => {
  const json = { name, value }

  return await ctx.schedule(() =>
    client
      .post<Option>("privated/options/update",)
      .pipe(withJsonBody(json))
      .exec()
  )
}, {
  name: "updateOptionAction",
  onFulfill: (ctx, updatedOption) => {
    optionsAtom.set(ctx, updatedOption.name, updatedOption)
  },
  onReject: (ctx, e) => {
    logError(e, { type: "combined" })
  }
})

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
    logError(e)
  }
}).pipe(withStatusesAtom(), withCache({ swr: false }))