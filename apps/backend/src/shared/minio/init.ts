import * as Minio from "minio"
import { logger } from "#/utils/config/logger"
import { isProduction, MINIO_ACCESS_KEY, MINIO_ENDPOINT, MINIO_PORT, MINIO_SECRET_KEY } from "../env"

export const minioLogger = logger.withTag("Minio")

const config: Minio.ClientOptions = {
  endPoint: isProduction ? MINIO_ENDPOINT : "127.0.0.1",
  port: MINIO_PORT,
  useSSL: false,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
}

let minio: Minio.Client | null = null;

export function initMinio() {
  try {
    minio = new Minio.Client(config)
    minioLogger.success(`Connected to ${config.endPoint}:${config.port}`)
  } catch (e) {
    minioLogger.error(e)
  }
}

export function getMinio() {
  if (!minio) throw new Error("Minio is not inited")
  return minio
}

export const SKINS_BUCKET = "skins"
export const AVATARS_BUCKET = "avatars"
export const STATIC_BUCKET = "static"
export const INTERNAL_FILES_BUCKET = "internal-files"

const BUCKETS = [SKINS_BUCKET, AVATARS_BUCKET]

export async function initMinioBuckets() {
  const minio = getMinio();

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
  const minio = getMinio();

  try {
    const buckets = await minio.listBuckets()
    const lines = buckets.map(bucket => `${bucket.name} - ${bucket.creationDate}`).join('\n')

    minioLogger.box(`Buckets:
${lines}
    `)
  } catch (e) {
    minioLogger.error(e)
  }
}