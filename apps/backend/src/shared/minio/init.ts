import { isProduction } from "#/helpers/is-production"
import { logger } from "#/utils/config/logger"
import * as Minio from "minio"

export const minio = new Minio.Client({
  endPoint: isProduction ? Bun.env.MINIO_ENDPOINT : "localhost",
  port: isProduction ? 443 : 9000, 
  useSSL: isProduction,
  accessKey: Bun.env.MINIO_ACCESS_KEY,
  secretKey: Bun.env.MINIO_SECRET_KEY,
})

export async function showMinio() {
  try {
    const buckets = await minio.listBuckets()
    const lines = buckets.map(bucket => `${bucket.name} - ${bucket.creationDate}`).join('\n')

    logger.box(`
      Buckets:
      ${lines}
    `)

  } catch (e) {
    console.error(e)
  }
}

export const SKINS_BUCKET = "skins"
export const AVATARS_BUCKET = "avatars"
export const STATIC_BUCKET = "static"

const BUCKETS = [SKINS_BUCKET, AVATARS_BUCKET]

export const getSkinDestination = (key: string) => `skin-${key}.png`
export const getAvatarDestination = (key: string) => `avatar-${key}.png`
export const getObjectUrl = (bucket: string, key: string) => `https://volume.fasberry.su/${bucket}/${key}`
export const getStaticObject = (name: string) => `https://volume.fasberry.su/${STATIC_BUCKET}/${name}`

export async function initMinioBuckets() {
  for (const target of BUCKETS) {
    const exists = await minio.bucketExists(target)

    if (exists) {
      logger.log('Bucket ' + target + ' exists.')
    } else {
      await minio.makeBucket(target, 'us-east-1')
      logger.log('Bucket ' + target + ' created in "us-east-1".')
    }
  }
}