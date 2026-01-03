import { getUrls } from "#/shared/constants/urls";
import { MAP_URL } from "#/shared/env";
import Elysia from "elysia";

const getServerMapUrl = (v: string) => MAP_URL.replace("[X]", v)

export const serversWithMap = new Elysia()
  .get("/servers-with-map", async (ctx) => {
    const data = [
      { name: "Bisquite", value: "bisquite", href: getServerMapUrl("bisquite"), img: "" },
      { name: "Muffin", value: "muffin", href: getServerMapUrl("muffin"), img: "" },
    ]

    return { data }
  })

export const serverip = new Elysia()
  .get("/server-ip", async ({ set }) => {
    const urls = getUrls();
    const ip = urls.get("server_proxy")

    set.headers["Cache-Control"] = "public, max-age=600, s-maxage=600"
    set.headers["vary"] = "Origin";
    
    return { data: { ip } }
  })