import Elysia from "elysia"
import { cacheControl, CacheControl } from "elysiajs-cdn-cache";

export const cacheSetup = () => new Elysia()
  .use(cacheControl("Cache-Control"))
