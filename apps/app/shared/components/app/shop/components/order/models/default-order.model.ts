import { action, atom } from "@reatom/core"
import { sleep, withAssign } from "@reatom/framework"
import { esAtom, orderDataAtom, orderRequestEventAtom } from "../../../models/store-order.model"

orderRequestEventAtom.onChange(async (ctx, target) => {
  if (target === 'invoice_paid') {
    showOrderLoaderAtom(ctx, true)
    await sleep(2000)
    showOrderLoaderAtom(ctx, false)
  }
})

export const isCopiedAtom = atom(false, "isCopied")

export const defaultOrderEvents = atom(null).pipe(
  withAssign((ctx, name) => ({
    disconnect: action((ctx) => {
      const source = ctx.get(esAtom);
      if (!source) return;

      source.close()
      esAtom.reset(ctx)
    }, `${name}.disconnect`),
    copyHref: action(async (ctx, value: string) => {
      await navigator.clipboard.writeText(value);
      isCopiedAtom(ctx, true)

      await ctx.schedule(() => sleep(2000))
      isCopiedAtom(ctx, false)
    }, `${name}.copyHref`)
  }))
)

export const showOrderLoaderAtom = atom(false, "showOrderLoader")

export const orderIsLoadingAtom = atom<boolean>((ctx) => {
  const target = ctx.spy(orderDataAtom)
  const es = ctx.spy(esAtom)
  const result = Boolean(target && es)
  return !result
}, "orderIsLoading")