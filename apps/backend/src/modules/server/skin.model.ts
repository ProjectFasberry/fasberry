import SteveSkin from "@repo/assets/images/minecraft/steve_skin.png";
import sharp from "sharp";
import ky from "ky";
import fs from "fs/promises";
import path from "path";
import { Blob } from "buffer";
import { Objm } from "@nats-io/obj";
import { skins } from "#/shared/database/skins-db";
import { getNatsConnection } from "#/shared/nats/nats-client";
import { USERS_SKINS_BUCKET } from "./init-buckets";

export async function extractHeadFromSkin(sb: ArrayBuffer) {
  return sharp(sb)
    .extract({ left: 8, top: 8, width: 8, height: 8 })
    .resize(128, 128, { kernel: 'nearest' })
    .toBuffer();
}

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

export function readableStreamFrom(data: Uint8Array): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(data);
      controller.close();
    },
  });
}

export async function blobToUint8Array(blob: globalThis.Blob | Blob): Promise<Uint8Array> {
  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
}

const DEFAULT_SKIN_VARIANT = "CLASSIC"

export async function getExistsCustomPlayerSkin(nickname: string) {
  const queryPlayersCustomSkins = await skins
    .selectFrom('sr_players')
    .innerJoin('sr_cache', 'sr_cache.uuid', 'sr_players.uuid')
    .innerJoin("sr_player_skins", "sr_player_skins.uuid", "sr_players.skin_identifier")
    .where("sr_cache.name", "=", nickname)
    .select(["sr_players.skin_variant", "sr_player_skins.value"])
    .executeTakeFirst();
  
  if (!queryPlayersCustomSkins?.value) {
    return null;
  }

  const { skin_variant, value } = queryPlayersCustomSkins

  return { skin_variant: skin_variant ?? DEFAULT_SKIN_VARIANT, value }
}

async function getVanillaPlayerSkin(nickname: string): Promise<globalThis.Blob | Blob | null> {
  const query = await skins
    .selectFrom("sr_cache")
    .select("uuid")
    .where("name", "=", nickname)
    .executeTakeFirst();

  if (!query || !query.uuid) {
    return null
  }

  const blob = await ky.get(`https://api.mineatar.io/skin/${query.uuid}`).blob() ?? null;

  return blob
}

async function getCustomPlayerSkin(nickname: string): Promise<globalThis.Blob | Blob | null> {
  const query = await getExistsCustomPlayerSkin(nickname)

  if (query && query.value) {
    const data = atob(query.value);
    const parsed = JSON.parse(data) as Skin

    const blob = await ky.get(parsed.textures.SKIN.url).blob() ?? null
  
    return blob
  } else {
    return null;
  }
}

async function putSkinInKv(nickname: string, skinData: Uint8Array) {
  try {
    const bucket = await getSkinBucket()
    const stream = readableStreamFrom(skinData);

    await bucket.put({ name: nickname }, stream);
  } catch (e) {
    console.error(e)
    throw e;
  }
}

let skinsBucket: ReturnType<Objm["open"]> | null = null;

async function getSkinBucket() {
  if (!skinsBucket) {
    const nc = getNatsConnection()
    const objm = new Objm(nc);

    skinsBucket = objm.open(USERS_SKINS_BUCKET);
  }

  return skinsBucket;
}

async function getSkinByKv(nickname: string): Promise<globalThis.Blob | Blob | null> {
  try {
    const bucket = await getSkinBucket()
    const entry = await bucket.get(nickname)
    
    if (!entry || !entry?.data) {
      return null;
    }
  
    const blob = await Bun.readableStreamToBlob(entry.data) ?? null;

    return blob
  } catch (e) {
    console.error(e)
    throw e
  }
}

export async function getPlayerSkin(nickname: string): Promise<globalThis.Blob | Blob> {
  let skin: globalThis.Blob | Blob | null = null;

  const exists = await getSkinByKv(nickname)

  if (exists) {
    skin = exists
  }

  if (skin) return skin;

  const custom = await getCustomPlayerSkin(nickname)

  if (custom) {
    const array = await blobToUint8Array(custom)

    await putSkinInKv(nickname, array)

    skin = custom
  }

  if (skin) return skin;

  const vanilla = await getVanillaPlayerSkin(nickname)

  if (vanilla) {
    const array = await blobToUint8Array(vanilla)

    await putSkinInKv(nickname, array)

    skin = vanilla
  }

  if (!skin) {
    const buffer = await fs.readFile(
      path.resolve(SteveSkin)
    );

    const blob = new Blob([buffer], { type: 'image/png' });

    skin = blob;
  }

  return skin
}