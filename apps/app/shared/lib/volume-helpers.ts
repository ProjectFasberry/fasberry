import { VOLUME_URL } from "../env"

export const getStaticImage = (target: string) => `${VOLUME_URL}/static/${target}`
export const getObjectUrl = (bucket: string, key: string) => `${VOLUME_URL}/${bucket}/${key}`