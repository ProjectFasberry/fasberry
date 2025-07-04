export function getObjectUrl(bucket: string, key: string) {
  return `https://volume.fasberry.su/${bucket}/${key}`
}

export const getSkinDestination = (key: string) => `skin-${key}.png`
export const getAvatarDestination = (key: string) => `avatar-${key}.png`
