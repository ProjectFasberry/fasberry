import { logger } from "#/utils/config/logger"
import * as Minio from "minio"
import { isProduction } from "../env"

export const minio = new Minio.Client({
  endPoint: isProduction ? Bun.env.MINIO_ENDPOINT : "127.0.0.1",
  port: 9000, 
  useSSL: false,
  accessKey: Bun.env.MINIO_ACCESS_KEY,
  secretKey: Bun.env.MINIO_SECRET_KEY,
})

export const minioLogger = logger.withTag("Minio")

export const SKINS_BUCKET = "skins"
export const AVATARS_BUCKET = "avatars"
export const STATIC_BUCKET = "static"
export const INTERNAL_FILES_BUCKET = "internal-files"

const BUCKETS = [SKINS_BUCKET, AVATARS_BUCKET]

export async function initMinioBuckets() {
  for (const target of BUCKETS) {
    const exists = await minio.bucketExists(target)

    if (exists) {
      minioLogger.log('Bucket ' + target + ' exists.')
    } else {
      await minio.makeBucket(target, 'us-east-1')
      minioLogger.log('Bucket ' + target + ' created in "us-east-1".')
    }
  }
}

export async function printBuckets() {
  try {
    const buckets = await minio.listBuckets()
    const lines = buckets.map(bucket => `${bucket.name} - ${bucket.creationDate}`).join('\n')

    minioLogger.box(`Buckets:
${lines}
    `)
  } catch (e) {
    minioLogger.error("Minio ", e)
  }
}