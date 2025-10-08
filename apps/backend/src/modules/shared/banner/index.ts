import Elysia from "elysia";
import { defineAdmin } from "#/lib/middlewares/define";
import { bannerLatest, bannerSolo } from "./banner-solo.route";
import { bannerCreate } from "./banner-create.route";
import { bannerView } from "./banner-view.route";
import { bannerDelete } from "./banner-delete.route";
import { bannerList } from "./banner-list.route";

const actions = new Elysia()
  .use(defineAdmin())
  .use(bannerCreate)
  .use(bannerDelete)

export const banner = new Elysia()
  .group("/banner", app => app
    .use(bannerList)
    .use(bannerLatest)
    .use(bannerSolo)
    .use(bannerView)
    .use(actions)
  )