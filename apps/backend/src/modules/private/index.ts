import Elysia from "elysia";
import { options } from "./options";
import { hideOpenApiConfig, openApiPlugin } from "#/lib/plugins/openapi";
import { permissions } from "./permissions";
import { storePrivate } from "./store";
import { users } from "./users";
import { roles } from "./roles";
import { validateBannedStatus } from "#/lib/middlewares/validators";
import { analytics } from "./analytics";
import { privatedNews } from "./news";
import { privatedBanners } from "./banners";
import { privatedModpacks } from "./modpacks";
import { privatedEvents } from "./events";
import { history } from "./history";

export const privated = new Elysia()
  .use(validateBannedStatus())
  .use(openApiPlugin)
  .group("/privated", hideOpenApiConfig, ctx => ctx
    .use(options)
    .use(permissions)
    .use(storePrivate)
    .use(users)
    .use(roles)
    .use(privatedNews)
    .use(privatedBanners)
    .use(privatedModpacks)
    .use(privatedEvents)
    .use(analytics)
    .use(history)
  )