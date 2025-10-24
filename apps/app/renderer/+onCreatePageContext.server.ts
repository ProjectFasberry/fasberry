import type { PageContextServer } from 'vike/types';
import { AtomState, createCtx } from '@reatom/core';
import { currentUserAtom, getMe } from "@/shared/models/current-user.model";
import { snapshotAtom } from '@/shared/lib/ssr';
import { logRouting } from '@/shared/lib/log';
import { isBotRequest } from '@/shared/lib/bot-guard';
import { initCookieOpts } from '@/shared/lib/sync';
import { redirect } from 'vike/abort';
import { appDictionariesAtom, appOptionsAtom, appOptionsInit, getAppDictionaries, getAppOptions } from '@/shared/models/app.model';
import { AppOptionsPayload } from '@repo/shared/types/entities/other';

export const onCreatePageContext = async (pageContext: PageContextServer) => {
  logRouting(pageContext.urlPathname, "onCreatePageContext");

  const { headers, urlPathname, locale } = pageContext;
  if (!headers) return;

  const ctx = createCtx();
  const updateSnapshot = () => (pageContext.snapshot = ctx.get(snapshotAtom));

  const setupApp = (
    app: { options: AppOptionsPayload, dictionaries: Record<string, string> },
    me: AtomState<typeof currentUserAtom> | null
  ) => {
    if (me) {
      currentUserAtom(ctx, me);
    }

    const { dictionaries, options } = app

    const dictionaryMap = new Map(Object.entries(dictionaries));
    const optionsExtend = { ...options, isAuth: Boolean(me), locale }

    appDictionariesAtom(ctx, dictionaryMap)
    appOptionsAtom(ctx, optionsExtend);
    initCookieOpts(ctx, pageContext);

    updateSnapshot();
  };

  if (isBotRequest(headers, urlPathname)) {
    setupApp({ options: appOptionsInit, dictionaries: {} }, null);
    return;
  }

  const [meResult, optionsResult, dictResult] = await Promise.allSettled([
    getMe({ headers }),
    getAppOptions({ headers }),
    getAppDictionaries({ headers }),
  ]);

  let me: AtomState<typeof currentUserAtom> | null = null;

  if (meResult.status === 'fulfilled') {
    me = meResult.value;
  } else if (meResult.reason instanceof Error && meResult.reason.message === 'banned') {
    if (!pageContext.urlParsed.pathname.includes('/banned')) {
      throw redirect("/banned");
    }
  }

  const options = optionsResult.status === 'fulfilled' ? optionsResult.value : appOptionsInit;
  const dictionaries = dictResult.status === 'fulfilled' ? dictResult.value : {};

  setupApp({ options, dictionaries }, me);
};