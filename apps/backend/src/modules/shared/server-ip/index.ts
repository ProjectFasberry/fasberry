import { getUrls } from "#/shared/constants/urls";
import Elysia from "elysia";

export const serverip = new Elysia()
  .get("/server-ip", async ({ set }) => {
    const urls = getUrls();
    const data = urls["server-proxy"]

    set.headers["Cache-Control"] = "public, max-age=600, s-maxage=600"
    set.headers["vary"] = "Origin";
    
    return { data }
  })