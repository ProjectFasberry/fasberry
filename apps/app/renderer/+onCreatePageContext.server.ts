import type { PageContext } from 'vike/types';
import { createCtx } from '@reatom/core';
import { currentUserAtom, getMe } from "@/shared/models/current-user.model";
import { snapshotAtom } from '@/shared/lib/ssr';
import { appOptionsAtom, getAppOptions, isAuthAtom } from '@/shared/models/global.model';
import { MePayload } from '@repo/shared/types/entities/user';
import { logRouting } from '@/shared/lib/log';

export const onCreatePageContext = async (pageContext: PageContext) => {
  logRouting(pageContext.urlPathname, "onCreatePageContext");
  
  const headers = pageContext.headers
  
  let user: MePayload | null = null;
  
  const ctx = createCtx()
  
  if (headers) {
    const [userData, options] = await Promise.all([
      getMe({ headers }),
      getAppOptions({ headers })
    ])

    user = userData
    
    currentUserAtom(ctx, user);
    isAuthAtom(ctx, !!user);
    appOptionsAtom(ctx, options)
  }
  
  const snapshot = ctx.get(snapshotAtom)
  
  pageContext.snapshot = snapshot
};