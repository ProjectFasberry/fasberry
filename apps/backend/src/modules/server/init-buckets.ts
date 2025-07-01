import { getNatsConnection } from "#/shared/nats/nats-client";
import { jetstream } from "@nats-io/jetstream";
import { Objm } from '@nats-io/obj';

export const USERS_SKINS_BUCKET = "users_skins"

export async function initSkinsBucket() {
  const nc = getNatsConnection();
  const js = jetstream(nc, { timeout: 10_000 });

  const objm = new Objm(js);

  let bucket = null;

  const list = objm.list()
  const next = await list.next()
  const buckets = next.map(key => key.bucket)

  if (buckets.includes(USERS_SKINS_BUCKET)) {
    console.log("Opened 'users_skins' bucket");

    bucket = await objm.open(USERS_SKINS_BUCKET)
  } else {
    console.log("Created 'users_skins' bucket");

    bucket = await objm.create(USERS_SKINS_BUCKET, { ttl: 2592000000000000, storage: "file" });
  }

  if (!bucket) {
    throw new Error("Failed to open bucket");
  }

  const watch = await bucket.watch();

  (async () => {
    for await (const e of watch) {
      console.log(`[Watch] ${e.name} / ${e.size} / ${e.revision}`);
    }
  })().then();
}