import { Ctx } from "@reatom/core";
import { PageContextServer } from "vike/types";
import { isDevelopment } from "../env";
import { parseCookie } from "./cookie";
import { playerSeemsLikePlayersIsShowAtom, playerSeemsLikePlayersIsShowKey } from "../components/app/player/models/player-seems-like.model";
import { parseBoolean } from "./validate-primitives";

type Target<T = any> = Record<string, {
  atom: (ctx: Ctx, atom: any) => void,
  validator?: (value: string | T) => T;
}>

const COOKIE_TARGETS: Target = {
  [playerSeemsLikePlayersIsShowKey]: {
    atom: playerSeemsLikePlayersIsShowAtom,
    validator: (v) => typeof v === "string" ? parseBoolean(v) : v
  }
};

export function initCookieOpts(ctx: Ctx, pageContext: PageContextServer) {
  const headers = pageContext.headers;
  if (!headers) return;

  const cookieStr = headers["cookie"];
  const cookies = parseCookie(cookieStr);
  if (!Object.keys(cookies).length) return;

  for (const [key, value] of Object.entries(cookies)) {
    const target = COOKIE_TARGETS[key as keyof typeof COOKIE_TARGETS];
    if (!target) continue;
    
    const finalValue = target.validator?.(value) ?? value;

    if (isDevelopment) {
      console.log(finalValue, "for", key);
    }

    target.atom(ctx, finalValue);
  }
}