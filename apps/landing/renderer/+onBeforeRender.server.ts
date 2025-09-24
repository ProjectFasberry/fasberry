import type { PageContextServer } from 'vike/types';
import { createCtx } from '@reatom/core';
import { snapshotAtom } from '@/shared/api/ssr';
import { logger } from '@repo/shared/lib/logger';
import { loggedUserAtom } from '@/shared/api/global.model';
import { isDevelopment } from '@/shared/env';

const LOGGED_USER_KEY = "logged_nickname"

function getCookie(
  header: string | null | undefined, 
  key: string
): string | undefined {
	if (!header) return undefined;

	const cookies = header.split(";").map(c => c.trim());

	for (const cookie of cookies) {
		const [cookieKey, ...rest] = cookie.split("=");

		if (cookieKey === key) {
			return decodeURIComponent(rest.join("="));
		}
	}

	return undefined;
}

export const onBeforeRender = async (pageContext: PageContextServer) => {
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

  if (isDevelopment) {
    logger.info(`\n${JSON.stringify(snapshot, null, 2)}\n`)
  }

  return {
    pageContext: {
      snapshot
    }
  }
};