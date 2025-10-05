import { STATIC_BUCKET } from "#/shared/minio/init"

export const getSkinName = (key: string) => `skin-${key}.png`
export const getAvatarName = (key: string) => `avatar-${key}.png`

export const getObjectUrl = (bucket: string, key: string) => `${process.env.VOLUME_ENDPOINT}/${bucket}/${key}`
export const getStaticUrl = (name: string) => `${process.env.VOLUME_ENDPOINT}/${STATIC_BUCKET}/${name}`