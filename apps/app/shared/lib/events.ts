import { Action, Ctx } from "@reatom/core";
import { pageContextAtom } from "../models/global.model";
import { isDevelopment } from "../env";

export function startPageEvents(
  ctx: Ctx,
  events: Action,
  opts: { urlTarget?: string, key?: string } = {}
) {
  const pageContext = ctx.get(pageContextAtom);
  if (!pageContext) return;

  const key = opts.key ?? opts.urlTarget ?? 'page';

  if (opts.urlTarget) {
    const urlPathname = pageContext.urlPathname ?? '';
    
    if (!urlPathname.includes(`/${opts.urlTarget}`)) {
      if (isDevelopment) console.log(`[${key}] Skip: URL not matching target`);
      return;
    }

    if (isDevelopment) console.log(`[${key}] URL match confirmed`);
  }

  if (isDevelopment) console.log(`[${key}] Triggering page events`);
  events(ctx);
}