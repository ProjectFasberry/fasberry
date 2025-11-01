import sharp from "sharp";
import { Blob } from "buffer";
import { skins } from "#/shared/database/skins-db";
import { AVATARS_BUCKET, getMinio, SKINS_BUCKET, STATIC_BUCKET } from "#/shared/minio/init";
import { ItemBucketMetadata } from "minio";
import { blobToUint8Array, nodeToWebStream } from "#/helpers/streams";
import { getAvatarName, getObjectUrl, getSkinName } from "#/helpers/volume";
import { client } from "#/shared/api/client";

type Skin = {
  textures: {
    SKIN: {
      url: string,
      metadata: {
        model: string
      }
    }
  }
}

type SkinOutput = globalThis.Blob | Blob

async function extractHeadFromSkin(sb: ArrayBuffer) {
  return sharp(sb)
    .extract({ left: 8, top: 8, width: 8, height: 8 })
    .resize(128, 128, { kernel: 'nearest' })
    .toBuffer();
}

const DEFAULT_SKIN_VARIANT = "CLASSIC"
const DEFAULT_HEAD = "steve_head.png"
const DEFAULT_SKIN = "steve_skin.png"

async function getExistsCustomPlayerSkin(nickname: string) {
  const queryPlayersCustomSkins = await skins
    .selectFrom('sr_players')
    .innerJoin('sr_cache', 'sr_cache.uuid', 'sr_players.uuid')
    .innerJoin("sr_player_skins", "sr_player_skins.uuid", "sr_players.skin_identifier")
    .select([
      "sr_players.skin_variant",
      "sr_player_skins.value"
    ])
    .where("sr_cache.name", "=", nickname)
    .executeTakeFirst();

  if (!queryPlayersCustomSkins?.value) return null;

  const { skin_variant, value } = queryPlayersCustomSkins

  return { skin_variant: skin_variant ?? DEFAULT_SKIN_VARIANT, value }
}

async function getVanillaPlayerSkin(nickname: string): Promise<SkinOutput | null> {
  const query = await skins
    .selectFrom("sr_cache")
    .select("uuid")
    .where("name", "=", nickname)
    .executeTakeFirst();

  if (!query?.uuid) return null

  const blob = await client.get(`https://api.mineatar.io/skin/${query.uuid}`).blob()

  return blob ?? null;
}

async function getCustomPlayerSkin(nickname: string): Promise<SkinOutput | null> {
  const query = await getExistsCustomPlayerSkin(nickname)

  if (!query?.value) return null;

  const data = atob(query.value);
  const parsed = JSON.parse(data) as Skin
  const blob = await client.get(parsed.textures.SKIN.url).blob()

  return blob ?? null
}

async function putSkinInMinio(nickname: string, file: Uint8Array) {
  const minio = getMinio();

  const metadata: ItemBucketMetadata = { 'Content-Type': 'image/png' }
  const destination = getSkinName(nickname)
  const avatarDest = getAvatarName(nickname)

  async function uploadSkin(buffer: Buffer<ArrayBuffer>) {
    await minio.putObject(SKINS_BUCKET, destination, buffer, buffer.length, metadata)
    console.log(`[${SKINS_BUCKET}]: ` + 'file ' + ' uploaded as object ' + destination)
  }

  async function uploadHead(buffer: Buffer<ArrayBuffer>) {
    const head = await extractHeadFromSkin(buffer.buffer)
    await minio.putObject(AVATARS_BUCKET, avatarDest, head, head.length, metadata)
    console.log(`[${AVATARS_BUCKET}]: ` + 'file ' + ' uploaded as object ' + avatarDest)
  }

  try {
    const buffer = Buffer.from(file);

    await Promise.all([
      uploadSkin(buffer), uploadHead(buffer)
    ])

  } catch (e) {
    console.error(e)
    throw e;
  }
}

export async function getRawSkin(nickname: string): Promise<SkinOutput> {
  const minio = getMinio();

  try {
    const stream = await minio.getObject(SKINS_BUCKET, getSkinName(nickname))
    const readable = nodeToWebStream(stream)
    const blob = await Bun.readableStreamToBlob(readable)

    return blob
  } catch (e) {
    const steve = await minio.getObject(STATIC_BUCKET, DEFAULT_SKIN)
    const readable = nodeToWebStream(steve)
    const blob = await Bun.readableStreamToBlob(readable)

    return blob;
  }
}

async function extract(
  nickname: string,
  fetchSkin: (nickname: string) => Promise<SkinOutput | null>
): Promise<SkinOutput | null> {
  const skin = await fetchSkin(nickname);
  if (!skin) return null;

  const array = await blobToUint8Array(skin as globalThis.Blob);

  await putSkinInMinio(nickname, array);

  return skin;
}

export async function getSkin(nickname: string): Promise<string> {
  const minio = getMinio();
  
  let target: string = ""

  try {
    const stream = await minio.getObject(SKINS_BUCKET, getSkinName(nickname))

    if (!stream) {
      throw new Error()
    }

    const url = getObjectUrl(SKINS_BUCKET, getSkinName(nickname))

    target = url
  } catch (e) {
    const custom = await extract(nickname, getCustomPlayerSkin)
    // if (custom) return custom;

    const vanilla = await extract(nickname, getVanillaPlayerSkin)
    // if (vanilla) return vanilla;

    const steve = getObjectUrl(STATIC_BUCKET, DEFAULT_SKIN)
    target = steve
  }

  return target;
}

export async function getPlayerAvatar({ recipient: nickname }: { recipient: string }) {
  const minio = getMinio();
  
  let target: string = "";

  try {
    const stream = await minio.getObject(AVATARS_BUCKET, getAvatarName(nickname))

    if (!stream) {
      throw new Error()
    }

    const res = getObjectUrl(AVATARS_BUCKET, getAvatarName(nickname))

    target = res;
  } catch (e) {
    const steve = getObjectUrl(STATIC_BUCKET, DEFAULT_HEAD)
    target = steve;
  }

  return target;
}