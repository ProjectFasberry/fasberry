import Elysia from "elysia";
import { news, soloNews } from "./news.route";
import { modpack } from "./modpack.route";
import { rules } from "./rules.route";
import { serverip } from "./server-ip.route";
import { publicImage } from "./image.route";

export const shared = new Elysia()
  .group("/shared", app => app
    .use(news)
    .use(soloNews)
    .use(modpack)
    .use(rules)
    .use(serverip)
    .use(publicImage)
  )