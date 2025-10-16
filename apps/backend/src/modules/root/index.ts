import Elysia, { t } from "elysia";
import { defineOptionalUser } from "#/lib/middlewares/define";
import { AppOptionsPayload } from "@repo/shared/types/entities/other";
import { bannerExists } from "../shared/banner/banner.model";
import { withData } from "#/shared/schemas";

const appOptionsList = new Elysia()
  .use(defineOptionalUser())
  .model({
    "options": withData(
      t.Object({
        bannerIsExists: t.Boolean()
      })
    )
  })
  .get("/options", async ({ nickname }) => {
    const bannerIsExists = await bannerExists(nickname)

    const data: AppOptionsPayload = {
      bannerIsExists
    }

    return { data }
  }, {
    response: {
      200: "options"
    }
  })

const appOptions = new Elysia()
  .group("/app", app => app
    .use(appOptionsList)
  )

export const root = new Elysia()
  .get("/health", ({ status }) => status(200))
  .use(appOptions)