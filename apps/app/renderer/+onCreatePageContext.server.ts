import type { PageContextServer } from 'vike/types';
import { AtomState, createCtx } from '@reatom/core';
import { currentUserAtom, getMe } from "@/shared/models/current-user.model";
import { snapshotAtom } from '@/shared/lib/ssr';
import { logRouting } from '@/shared/lib/log';
import { isBotRequest } from '@/shared/lib/bot-guard';
import { initCookieOpts } from '@/shared/lib/sync';
import { redirect } from 'vike/abort';
import { appOptionsAtom, appOptionsInit, getAppOptions } from '@/shared/models/app-options.model';
import { AppOptionsPayload } from '@repo/shared/types/entities/other';

export const onCreatePageContext = async (pageContext: PageContextServer) => {
  logRouting(pageContext.urlPathname, "onCreatePageContext");

  const { headers, urlPathname } = pageContext;
  if (!headers) return;

  const ctx = createCtx();
  const updateSnapshot = () => (pageContext.snapshot = ctx.get(snapshotAtom));

  const setupApp = (options: AppOptionsPayload, me: AtomState<typeof currentUserAtom> | null) => {
    if (me !== null) {
      currentUserAtom(ctx, me);
    }

    appOptionsAtom(ctx, { 
      ...options,
      isAuth: Boolean(me), 
      locale: pageContext.locale 
    });

    initCookieOpts(ctx, pageContext);

    updateSnapshot();
  };

  if (isBotRequest(headers, urlPathname)) {
    setupApp(appOptionsInit, null);
    return;
  }

  const [me, options] = await Promise.allSettled([
    getMe({ headers }),
    getAppOptions({ headers }),
  ]);

  if (me.status === 'rejected') {
    const reason = me.reason

    if (reason instanceof Error) {
      const error = reason.message;

      if (error === 'banned') {
        const pathname = pageContext.urlParsed.pathname;

        if (!pathname.includes('/banned')) {
          throw redirect("/banned")
        }
      }
    }
  }

  setupApp(
    options.status === 'fulfilled' ? options.value : appOptionsInit,
    me.status === 'fulfilled' ? me.value : null
  );
};