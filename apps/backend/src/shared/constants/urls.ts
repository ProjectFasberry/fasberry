import { appLogger } from "#/utils/config/logger";
import { general } from "../database/general-db"

let URLS: Map<string, string> = new Map()

const targets = ["server_proxy", "panel", "domain"];

export async function initURLS() {
  const query = await general
    .selectFrom("ip_list")
    .select(["ip", "name"])
    .where("name", "in", targets)
    .execute();

  for (const { ip, name } of query) {
    URLS.set(name, ip)
    appLogger.log(`URL for ${name} inited. Content: ${ip}`)
  }

  appLogger.success(`URLS inited. Loaded ${Object.keys(URLS).length}`)
}

export function getUrls() {
  if (URLS.size === 0) console.warn("URLS is empty")
  return URLS;
}