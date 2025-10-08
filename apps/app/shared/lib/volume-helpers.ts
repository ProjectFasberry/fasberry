import { VOLUME_PREFIX } from "../env"

export const getStaticImage = (target: string) => `${VOLUME_PREFIX}/static/${target}`
export const getObjectUrl = (bucket: string, key: string) => `${VOLUME_PREFIX}/${bucket}/${key}`