import { atom } from "@reatom/core"
import { AppOptionsPayload } from "@repo/shared/types/entities/other"
import { withSsr } from "../lib/ssr"
import { client } from "../lib/client-wrapper"
import { Locale } from "../locales"

export const APP_OPTIONS_KEY = "appOptions"

export type AppOptionsPayloadExtend = AppOptionsPayload & {
  isAuth: boolean,
  locale: Locale
}

export const appOptionsInit: AppOptionsPayloadExtend = {
  bannerIsExists: false,
  isBanned: false,
  isAuth: false,
  locale: "ru"
}

export const appOptionsAtom = atom<AppOptionsPayloadExtend>(appOptionsInit, "appOptions").pipe(
  withSsr(APP_OPTIONS_KEY)
)

export async function getAppOptions(init: RequestInit) {
  return client<AppOptionsPayload>("app/options", init).exec()
}