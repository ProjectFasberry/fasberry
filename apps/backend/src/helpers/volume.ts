import { STATIC_BUCKET } from "#/shared/minio/init"

export const getSkinDestination = (key: string) => `skin-${key}.png`
export const getAvatarDestination = (key: string) => `avatar-${key}.png`
export const getObjectUrl = (bucket: string, key: string) => `https://volume.fasberry.su/${bucket}/${key}`
export const getStaticObject = (name: string) => `https://volume.fasberry.su/${STATIC_BUCKET}/${name}`