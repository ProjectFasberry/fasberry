// import sharp from "sharp";
import { Blob } from "buffer";
import { skins } from "#/shared/database/skins-db";
import { AVATARS_BUCKET, getMinio, SKINS_BUCKET, STATIC_BUCKET } from "#/shared/minio/init";
import { ItemBucketMetadata } from "minio";
import { blobToUint8Array, nodeToWebStream } from "#/helpers/streams";
import { getAvatarName, getObjectUrl, getSkinName } from "#/helpers/volume";
import { client } from "#/shared/api/client";
import { Context } from "elysia";
import { readableStreamToBlob } from "bun";
import { Timing } from "#/utils/config/timing";

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
  return ""
}

const DEFAULT_SKIN_VARIANT = "CLASSIC"
const DEFAULT_HEAD = "fallback/steve_head.png"
const DEFAULT_SKIN = "fallback/steve_skin.png"

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
  }

  async function uploadHead(buffer: Buffer<ArrayBuffer>) {
    const head = await extractHeadFromSkin(buffer.buffer)
    await minio.putObject(AVATARS_BUCKET, avatarDest, head, head.length, metadata)
  }

  try {
    const buffer = Buffer.from(file);

    await Promise.all([
      uploadSkin(buffer), uploadHead(buffer)
    ])

  } catch (e) {
    throw e;
  }
}

export async function getRawSkin(nickname: string): Promise<SkinOutput> {
  const minio = getMinio();

  try {
    const stream = await minio.getObject(SKINS_BUCKET, getSkinName(nickname))
    const readable = nodeToWebStream(stream)
    const blob = await readableStreamToBlob(readable)

    return blob
  } catch (e) {
    const steve = await minio.getObject(STATIC_BUCKET, DEFAULT_SKIN)
    const readable = nodeToWebStream(steve)
    const blob = await readableStreamToBlob(readable)

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

export async function getSkin(set: Context["set"], nickname: string): Promise<string> {
  const t = new Timing(); 
  const minio = getMinio();

  let result: string = ""

  try {
    t.start("get stream");
    const stream = await minio.getObject(SKINS_BUCKET, getSkinName(nickname))
    t.end("get stream");

    if (!stream) throw new Error()

    t.start("get url");
    const url = getObjectUrl(SKINS_BUCKET, getSkinName(nickname))
    t.start("get url");

    result = url
  } catch (e) {
    // t.start("extract custom");
    // const custom = await extract(nickname, getCustomPlayerSkin)
    // if (custom) return custom;
    // t.end("extract custom");

    // t.start("extract vanilla");
    // const vanilla = await extract(nickname, getVanillaPlayerSkin)
    // if (vanilla) return vanilla;
    // t.end("extract vanilla");

    const steve = getObjectUrl(STATIC_BUCKET, DEFAULT_SKIN)
    result = steve
  }

  set.headers["server-timing"] = t.header();

  return result;
}

export async function getPlayerAvatar(set: Context["set"], nickname: string): Promise<string> {
  const t = new Timing(); 
  const minio = getMinio();

  let result: string = "";

  try {
    t.start("get stream");
    const stream = await minio.getObject(AVATARS_BUCKET, getAvatarName(nickname))
    t.end("get stream");

    if (!stream) throw new Error()

    t.start("get url");
    const url = getObjectUrl(AVATARS_BUCKET, getAvatarName(nickname))
    t.end("get url");

    result = url;
  } catch (e) {
    const steve = getObjectUrl(STATIC_BUCKET, DEFAULT_HEAD)
    result = steve;
  }

  set.headers["server-timing"] = t.header();

  return result;
}