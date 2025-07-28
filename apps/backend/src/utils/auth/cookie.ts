import { isProduction } from "#/helpers/is-production"
import { Cookie } from "elysia"

type Properties = {
  cookie: Record<string, Cookie<string | undefined>>,
  key: string,
}

type SetCookie = Properties & {
  value: string,
  expires: Date
}

export const DOMAIN = ".fasberry.su"
export const SESSION_KEY = "session";
export const CROSS_SESSION_KEY = "logged_nickname"

export function setCookie({ cookie, key, expires, value }: SetCookie) {
  cookie[key].domain = isProduction ? DOMAIN : "localhost"
  cookie[key].value = value
  cookie[key].expires = expires
  cookie[key].httpOnly = true
  cookie[key].path = "/"
  cookie[key].secure = true
  cookie[key].sameSite = "none"
}

export function unsetCookie({ cookie, key }: Properties) {
  cookie[key].domain = isProduction ? DOMAIN : "localhost"
  cookie[key].value = ""
  cookie[key].expires = new Date(0)
  cookie[key].path = "/"
  cookie[key].secure = true
  cookie[key].maxAge = 0
  cookie[key].sameSite = "none"
}