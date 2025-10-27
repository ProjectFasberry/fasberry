import { hideOpenApiConfig, openApiPlugin } from "#/lib/plugins/openapi";
import Elysia from "elysia";
import { bannerCreate } from "./banner-create.route";
import { bannerDelete } from "./banner-delete.route";

export const privatedBanners = new Elysia(hideOpenApiConfig)
  .use(openApiPlugin())
  .group("/banners", app => app
    .use(bannerCreate)
    .use(bannerDelete)
  )