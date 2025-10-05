import Elysia from "elysia"
import { getNatsConnection } from "#/shared/nats/client"
import { SERVER_EVENT_GET_USER_LOCATION, SERVER_USER_EVENT_SUBJECT } from "#/shared/nats/subjects"
import { HttpStatusEnum } from "elysia-http-status-code/status"
import { defineUser } from "#/lib/middlewares/define"

type UserLocation = {
  world: string,
  x: number,
  y: number,
  z: number,
  pitch: number,
  yaw: number,
  customLocation: string | null
}

async function getLocation(nickname: string) {
  const nc = getNatsConnection()

  const payload = { event: SERVER_EVENT_GET_USER_LOCATION, nickname }
  
  try {
    const res = await nc.request(SERVER_USER_EVENT_SUBJECT, JSON.stringify(payload), { timeout: 1000 })
    if (!res) return null;
  
    const data = res.json<Omit<UserLocation, "customLocation">>()
    return data
  } catch (e) {
    throw e
  }
}

function parseWorldName(input: string): string | null {
  const regex = /CraftWorld\{name=(.+?)\}/;
  const match = input.match(regex);
  return match ? match[1] : null;
}

interface Cuboid {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  title: string;
  world: "Offenburg" | "BisquiteWorld" | string
}

type LocationNames =
  | "spawnpoint"
  | "bar-brat"

const terrainMap: Map<LocationNames, Cuboid> = new Map([
  ["spawnpoint", {
    minX: 478,
    maxX: 493,
    minZ: -2689,
    maxZ: -2672,
    title: "Точка появления",
    world: "Offenburg"
  }],
  ["bar-brat", {
    minX: 503,
    maxX: 519,
    minZ: -2646,
    maxZ: -2628,
    title: "Бар <Брат>",
    world: "Offenburg",
  }]
]);

type GetCustomLocation = {
  world: string,
  coords: Pick<UserLocation, "x" | "z">
}

function getCustomLocation({
  coords, world
}: GetCustomLocation): string | null {
  const { x, z } = coords;

  let title: string | null = null;

  for (const [_, target] of terrainMap) {
    if (world === target.world) {
      if (
        x >= target.minX && x <= target.maxX &&
        z >= target.minZ && z <= target.maxZ
      ) {
        return title = target.title;
      }
    }
  }

  if (!title && world === 'Offenburg') {
    title = "где-то на спавне"
    return title;
  }

  return null;
}

export const userLocation = new Elysia()
  .use(defineUser())
  .get("/location/:nickname", async ({ status, nickname: initiator, ...ctx }) => {
    const recipient = ctx.params.nickname;

    const rawLocation = await getLocation(recipient)

    if (!rawLocation) {
      return status(HttpStatusEnum.HTTP_200_OK, { data: null })
    }

    let location: UserLocation | null = null;
    let world: string = parseWorldName(rawLocation.world) ?? rawLocation.world

    location = {
      ...rawLocation,
      world,
      customLocation: getCustomLocation({
        world,
        coords: { x: rawLocation.x, z: rawLocation.z }
      })
    }

    return status(HttpStatusEnum.HTTP_200_OK, { data: location })
  })