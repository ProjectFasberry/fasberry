import { getUrls } from "#/shared/constants/urls"
import { isProduction } from "#/shared/env"
import type { Context } from "elysia"

type Properties = {
  cookie: Context["cookie"],
  key: string,
}

type SetCookie = Properties & {
  value: string,
  expires: Date
}

export const getDomain = () => {
  const urls = getUrls()
  return `.${urls["domain"]}`
}

export const SESSION_KEY = "session";

export function setCookie({ cookie, key, expires, value }: SetCookie) {
  const domain = getDomain()
  
  cookie[key].domain = isProduction ? domain : "127.0.0.1"
  cookie[key].value = value
  cookie[key].expires = expires
  cookie[key].httpOnly = true
  cookie[key].path = "/"
  cookie[key].secure = true
  cookie[key].sameSite = "none"
}

export function unsetCookie({ cookie, key }: Properties) {
  const domain = getDomain()

  cookie[key].domain = isProduction ? domain : "127.0.0.1"
  cookie[key].value = ""
  cookie[key].expires = new Date(0)
  cookie[key].path = "/"
  cookie[key].secure = true
  cookie[key].maxAge = 0
  cookie[key].sameSite = "none"
}