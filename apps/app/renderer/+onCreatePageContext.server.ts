import type { PageContext } from 'vike/types';
import { createCtx } from '@reatom/core';
import { currentUserAtom, getMe } from "@/shared/models/current-user.model";
import { snapshotAtom } from '@/shared/lib/ssr';
import { isClientAtom } from '@/shared/models/global.model';

export const onCreatePageContext = async (pageContext: PageContext) => {
  const headers = pageContext.headers
  
  let user: CurrentUser | null = null;
  
  const ctx = createCtx()
  
  if (headers) {
    user = await getMe({ headers })

    currentUserAtom(ctx, user)
  }
  
  isClientAtom(ctx, !!pageContext.Page)

  const snapshot = ctx.get(snapshotAtom)
  
  pageContext.snapshot = snapshot
};