import Elysia, { t } from "elysia"
import { defineUser } from "#/lib/middlewares/define"
import { getCustomLocation, getLocation, parseWorldName, UserLocation } from "./location.model"
import { withData } from "#/shared/schemas"

const userLocationPayload = t.Object({
  world: t.String(),
  x: t.Number(),
  y: t.Number(),
  z: t.Number(),
  pitch: t.Number(),
  yaw: t.Number(),
  customLocation: t.Nullable(t.String())
})

export const playerLocation = new Elysia()
  .use(defineUser())  
  .model({
    "location": withData(
      t.Nullable(userLocationPayload)
    )
  })
  .get("/location/:nickname", async ({ params }) => {
    const recipient = params.nickname;
    const rawLocation = await getLocation(recipient)

    if (!rawLocation) return { data: null }

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

    return { data: location }
  }, {
    response: {
      200: "location"
    }
  })