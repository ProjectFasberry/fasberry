import type { PageContext } from 'vike/types';
import { createCtx } from '@reatom/core';
import { snapshotAtom } from '@/shared/api/ssr';
import { loggedUserAtom } from '@/shared/api/global.model';

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

export const onCreatePageContext = async (pageContext: PageContext) => {
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

  return {
    pageContext: {
      snapshot
    }
  }
};