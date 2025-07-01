import Elysia from "elysia"
import { ip } from "elysia-ip"
import { cacheControl, CacheControl } from "elysiajs-cdn-cache";

export const ipSetup = new Elysia()
  .use(ip({ checkHeaders: ["X-Forwarded-For", "X-Real-IP"] }))

export const cookieSetup = new Elysia()
  .derive(
    { as: "global" },
    ({ cookie }) => ({ session: cookie["session"].value ?? null })
  )

export const cacheSetup = new Elysia()
  .use(cacheControl("Cache-Control"))
