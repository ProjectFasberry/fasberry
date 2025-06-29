import type { PageContext } from 'vike/types';
import { createCtx } from '@reatom/core';
import { currentUserAtom, getMe } from '@/shared/api/global.model';
import { snapshotAtom } from '@/shared/api/ssr';

export const onCreatePageContext = async (pageContext: PageContext) => {
  const ctx = createCtx()
  const headers = pageContext.headers
  
  let user: CurrentUser | null = null;

  if (headers) {
    user = await getMe(headers)

    currentUserAtom(ctx, user)
  }

  const snapshot = ctx.get(snapshotAtom) 
  
  pageContext.snapshot = snapshot
};