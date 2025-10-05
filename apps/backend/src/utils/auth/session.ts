import { refreshSession } from "#/modules/auth/auth.model";
import { Context } from "elysia";
import { CROSS_SESSION_KEY, SESSION_KEY, setCookie } from "./cookie";

export async function updateSession(
  token: string, 
  cookie: Context["cookie"]
) {
  const refreshResult = await refreshSession(token);

  if (refreshResult) {
    const { expires_at, nickname } = refreshResult;

    setCookie({
      cookie,
      key: SESSION_KEY,
      expires: expires_at,
      value: token
    })

    setCookie({
      cookie,
      key: CROSS_SESSION_KEY,
      expires: expires_at,
      value: nickname
    })
  }
}