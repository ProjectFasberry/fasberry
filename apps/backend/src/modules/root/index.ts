import Elysia from "elysia";
import { defineOptionalUser } from "#/lib/middlewares/define";
import { AppOptionsPayload } from "@repo/shared/types/entities/other";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { bannerExists } from "../shared/banner/banner.model";

const appOptions = new Elysia()
  .use(defineOptionalUser())
  .group("/app", app => app
    .get("/options", async ({ status, nickname }) => {
      const bannerIsExists = await bannerExists(nickname)
      
      const data: AppOptionsPayload = {
        bannerIsExists
      }

      return status(HttpStatusEnum.HTTP_200_OK, { data })
    })
  )

export const root = new Elysia()
  .get("/health", ({ status }) => status(200))
  .use(appOptions)