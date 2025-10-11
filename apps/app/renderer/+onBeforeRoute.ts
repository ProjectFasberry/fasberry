import { Locale, localeDefault, locales } from '@/shared/locales'
import { modifyUrl } from 'vike/modifyUrl'
import { PageContext } from 'vike/types'

function extractLocale(pathname: string) {
  let locale: Locale = localeDefault
  let pathnameWithoutLocale = pathname

  const path = pathname.split('/')
  const first = path[1]

  if (locales.includes(first as Locale)) {
    if (first !== localeDefault) {
      locale = first as Locale
      pathnameWithoutLocale = '/' + path.slice(2).join('/')
    }
  }

  return { locale, pathnameWithoutLocale }
}

export function onBeforeRoute(pageContext: PageContext) {
  const url = pageContext.urlParsed;
  
  const { locale, pathnameWithoutLocale } = extractLocale(url.pathname);
  
  const urlWithoutLocale = pathnameWithoutLocale.startsWith('/')
    ? pathnameWithoutLocale
    : '/' + pathnameWithoutLocale

  return {
    pageContext: {
      locale,
      urlLogical: urlWithoutLocale
    }
  }
}