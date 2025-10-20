import { PageContext, PageContextServer } from "vike/types";
import { Locale, localeDefault } from ".";
import { translations } from "./translations";
import { localeAtom } from "../models/page-context.model";
import { CtxSpy } from "@reatom/core";

export function getUrlWithLocale(pageContext: PageContext, pathname: string) {
  const locale = pageContext.locale
  let url;
  if (locale === localeDefault) {
    url = pathname
  } else {
    url = `/${pageContext.locale}${pathname}`
  }
  return url
}

export function translate(text: string, locale: Locale) {
  if (locale === localeDefault) {
    return text
  }

  // @ts-expect-error
  const textTranslations = translations[text]

  if (!textTranslations) {
    console.error('No translation found for: `' + text + '`');
    return text
  }

  const result = textTranslations[locale]

  return result
}

export function getServerLocale(pageContext: PageContextServer) {
  const locale = pageContext.locale;
  return locale
}

export function getClientLocale(ctx: CtxSpy) {
  return ctx.spy(localeAtom)
}