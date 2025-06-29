import type { OnBeforeRenderAsync, PageContext } from 'vike/types';
import { createCtx } from '@reatom/core';
import { snapshotAtom } from '@/shared/api/ssr';
import { logger } from '@repo/lib/logger';
import { loggedUserAtom } from '@/shared/api/global.model';
import { getCookie } from "@repo/lib/get-cookie"

const LOGGED_USER_KEY = "logged_nickname"

export const onBeforeRender: OnBeforeRenderAsync = async (pageContext) => {
  const ctx = createCtx()
  const headers = pageContext.headers;

  let loggedUser: string | undefined = undefined;

  if (headers) {
    const cookie = headers["cookie"] as string | undefined;

    if (cookie) {
      const target = getCookie(cookie, LOGGED_USER_KEY)
  
      if (target && target.length >= 2) {
        loggedUser = target
      }
    }
  }

  loggedUserAtom(ctx, loggedUser)

  const snapshot = ctx.get(snapshotAtom)

  import.meta.env.DEV && logger.info(`\n${JSON.stringify(snapshot, null, 2)}\n`)

  return {
    pageContext: {
      snapshot
    }
  }
};