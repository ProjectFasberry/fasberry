import { atom } from "@reatom/core"
import { AppOptionsPayload } from "@repo/shared/types/entities/other"
import { withSsr } from "../lib/ssr"
import { client } from "../lib/client-wrapper"
import { Locale } from "../locales"
import { reatomMap } from "@reatom/framework"

export type AppOptionsPayloadExtend = AppOptionsPayload & {
  locale: Locale,
  country: string | null
}

export const appOptionsInit: AppOptionsPayloadExtend = {
  bannerIsExists: false,
  isBanned: false,
  isAuth: false,
  locale: "ru",
  country: null,
  isWl: false
}

export const APP_OPTIONS_KEY = "appOptions"

export const appOptionsAtom = atom<AppOptionsPayloadExtend>(appOptionsInit, "appOptions").pipe(
  withSsr(APP_OPTIONS_KEY)
)

export async function getAppOptions(init: RequestInit) {
  return client<AppOptionsPayload>("app/options", init).exec()
}

export const APP_DICTIONARIES_KEY = "appDictionaries"

export const appDictionariesAtom = reatomMap<string, string>().pipe(
  withSsr(APP_DICTIONARIES_KEY)
)

export async function getAppDictionaries(init: RequestInit) {
  return client<Record<string, string>>("app/dictionaries", init).exec()
}