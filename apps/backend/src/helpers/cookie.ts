import { Cookie } from "elysia"
import { isProduction } from "./is-production"

type Properties = {
  cookie: Record<string, Cookie<string | undefined>>,
  key: string,
}

type SetCookie = Properties & {
  value: string,
  expires: Date
}

export function setCookie({ cookie, key, expires, value }: SetCookie) {
  cookie[key].domain = isProduction() ? ".fasberry.su" : "localhost"
  cookie[key].value = value
  cookie[key].expires = expires
  cookie[key].httpOnly = true
  cookie[key].path = "/"
  cookie[key].secure = isProduction()
}

export function unsetCookie({ cookie, key }: Properties) {
  cookie[key].domain = isProduction() ? ".fasberry.su" : "localhost"
  cookie[key].value = ""
  cookie[key].expires = new Date(0)
  cookie[key].path = "/"
  cookie[key].secure = isProduction()
  cookie[key].maxAge = 0
  cookie[key].sameSite = "none"
}