import { VOLUME_ENDPOINT } from "../env";

export function getStaticObject(path: string, target: string) {
  return `${VOLUME_ENDPOINT}/static/${path}/${target}`
}
