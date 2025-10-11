import type { PageContextServer } from 'vike/types';
import { AtomState, createCtx } from '@reatom/core';
import { currentUserAtom, getMe } from "@/shared/models/current-user.model";
import { snapshotAtom } from '@/shared/lib/ssr';
import { appOptionsAtom, appOptionsInit, getAppOptions, isAuthAtom, localeAtom } from '@/shared/models/global.model';
import { logRouting } from '@/shared/lib/log';
import { isBotRequest } from '@/shared/lib/bot-guard';
import { initCookieOpts } from '@/shared/lib/sync';

export const onCreatePageContext = async (pageContext: PageContextServer) => {
  logRouting(pageContext.urlPathname, "onCreatePageContext");

  const { headers, urlPathname } = pageContext;
  if (!headers) return;

  const ctx = createCtx();
  const updateSnapshot = () => (pageContext.snapshot = ctx.get(snapshotAtom));

  const setupApp = (options: AtomState<typeof appOptionsAtom>, me?: AtomState<typeof currentUserAtom>) => {
    if (me !== undefined) {
      currentUserAtom(ctx, me);
      isAuthAtom(ctx, Boolean(me));
    }

    appOptionsAtom(ctx, options);
    localeAtom(ctx, pageContext.locale)
    initCookieOpts(ctx, pageContext);
    updateSnapshot();
  };

  if (isBotRequest(headers, urlPathname)) {
    setupApp(appOptionsInit);
    return;
  }

  const [me, options] = await Promise.allSettled([
    getMe({ headers }),
    getAppOptions({ headers }),
  ]);

  setupApp(
    options.status === 'fulfilled' ? options.value : appOptionsInit,
    me.status === 'fulfilled' ? me.value : undefined
  );
};