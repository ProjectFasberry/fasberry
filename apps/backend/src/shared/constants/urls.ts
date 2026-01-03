import { invariant } from "#/helpers/invariant";
import { appLogger } from "#/utils/config/logger";
import { general } from "../database/general-db"

let URLS: Map<string, string> | null = null

const WHITELIST_PREFIX = "_wl";

export function getWhitelistIpList(): string[] {
  const urls = getUrls()

  const result: string[] = []

  for (const [key, value] of urls) {
    if (key.startsWith(WHITELIST_PREFIX)) {
      result.push(value)
    }
  }

  return result
}

async function getUrlsQuery() {
  return general
    .selectFrom("ip_list")
    .select(["ip", "name"])
    .execute();
}

export async function initURLS() {
  try {
    const query = await getUrlsQuery()

    URLS = new Map(query.map(({ name, ip }) => {
      appLogger.log(`URL for ${name} inited. Content: ${ip}`)
      return [name, ip]
    }))

    appLogger.success(`URLS inited. Loaded ${Object.keys(URLS).length}`)
  } catch (e) {
    appLogger.error(e)
  }
}

export async function revalidateUrls(): Promise<
  { ok: true, data: { upd: number, prev: number } } |
  { ok: false, error: unknown | Error }
> {
  const prev = URLS?.size ?? 0;

  try {
    const query = await getUrlsQuery()

    URLS = new Map(query.map(({ name, ip }) => {
      appLogger.log(`URL for ${name} inited. Content: ${ip}`)
      return [name, ip]
    }))

    return { ok: true, data: { prev, upd: URLS.size ?? 0 } }
  } catch (e) {
    appLogger.error(e)
    return { ok: false, error: e }
  }
}

export function getUrls() {
  invariant(URLS, "Urls is not defined");
  if (URLS.size === 0) console.warn("URLS is empty")
  return URLS;
}