import { hideOpenApiConfig, openApiPlugin } from "#/lib/plugins/openapi";
import Elysia from "elysia";
import { modpackCreate } from "./modpack-create.route";
import { modpackDelete } from "./modpack-delete.route";

export const privatedModpacks = new Elysia(hideOpenApiConfig)
  .use(openApiPlugin())
  .group("/modpacks", app => app
    .use(modpackCreate)
    .use(modpackDelete)
  )