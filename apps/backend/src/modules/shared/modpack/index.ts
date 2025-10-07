import Elysia from "elysia";
import { modpackList } from "./modpack-list.route";
import { modpackCreate } from "./modpack-create.route";
import { modpackDelete } from "./modpack-delete.route";
import { defineAdmin } from "#/lib/middlewares/define";
import { modpackSolo } from "./modpack-solo.route";

export const modpack = new Elysia()
  .group("/modpack", app => app
    .use(modpackList)
    .use(modpackSolo)
    .use(defineAdmin())
    .use(modpackCreate)
    .use(modpackDelete)
  )