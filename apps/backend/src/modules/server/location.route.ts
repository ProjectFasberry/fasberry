import { throwError } from "#/helpers/throw-error"
import { getNatsConnection } from "#/shared/nats/nats-client"
import { SERVER_EVENT_GET_USER_LOCATION, SERVER_USER_EVENT_SUBJECT } from "#/shared/nats/nats-subjects"
import Elysia from "elysia"
import { HttpStatusEnum } from "elysia-http-status-code/status"

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

  const res = await nc.request(SERVER_USER_EVENT_SUBJECT, JSON.stringify(payload), { timeout: 7000 })
  if (!res) return null;

  const data = res.json<Omit<UserLocation, "customLocation">>()
  return data
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

  for (const [_, cuboid] of terrainMap) {
    if (world === cuboid.world) {
      if (x >= cuboid.minX && x <= cuboid.maxX && z >= cuboid.minZ && z <= cuboid.maxZ) {
        return title = cuboid.title;
      }
    }
  }

  if (!title && world === 'Offenburg') {
    return title = "где-то на спавне"
  }

  return null;
}

export const userLocation = new Elysia()
  .get("/location/:nickname", async (ctx) => {
    const initiator = "Test"
    const { nickname: recipient } = ctx.params

    try {
      const rawLocation = await getLocation(recipient)

      if (!rawLocation) {
        return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: null })
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

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: location })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  })