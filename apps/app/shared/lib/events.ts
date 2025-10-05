import { Action, Ctx } from "@reatom/core";
import { pageContextAtom } from "../models/global.model";

export function startPageEvents(
  ctx: Ctx,
  events: Action,
  opts: { urlTarget: string, key?: string }
) {
  const pageContext = ctx.get(pageContextAtom);
  if (!pageContext) return;

  const key = opts.key ?? opts.urlTarget

  function validate(ctx: Ctx, key: string) {
    console.log(`[${key}] Start page validation`);

    const urlPathname = ctx.get(pageContextAtom)?.urlPathname ?? "";
    const isIdentity = urlPathname.includes(`/${key}`)

    return { isIdentity }
  }

  const { isIdentity } = validate(ctx, opts.urlTarget);

  if (!isIdentity) {
    console.log(`[${key}] Stop page validation. Reason: not identity`)
    return
  }

  console.log(`[${key}] Start page events`)
  events(ctx)
}