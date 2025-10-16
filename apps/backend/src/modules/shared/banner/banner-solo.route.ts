import Elysia, { t } from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { bannerSchema } from "./banner.model";
import { BannerPayload } from "@repo/shared/types/entities/banner";
import { general } from "#/shared/database/main-db";
import { withData } from "#/shared/schemas";
import { bannerPayload } from "./banner-list.route";

const baseQuery = general
  .selectFrom("banners")
  .select(["id", "title", "description", "href_title", "href_value"])

async function getLatestBanner(): Promise<BannerPayload | null> {
  const query = await baseQuery
    .orderBy("created_at", "desc")
    .executeTakeFirst()

  if (!query) return null;

  const { href_title, href_value, ...base } = query

  return {
    ...base,
    href: {
      title: href_title,
      value: href_value
    }
  }
}

async function getBanner(
  id: number
): Promise<BannerPayload | null> {
  const query = await baseQuery
    .where("id", "=", id)
    .executeTakeFirst()

  if (!query) return null;

  const { href_title, href_value, ...base } = query

  return {
    ...base,
    href: {
      title: href_title,
      value: href_value
    }
  }
}

export const bannerSolo = new Elysia()
  .model({
    "banner": withData(
      t.Nullable(bannerPayload)
    )
  })
  .get("/:id", async ({ status, params }) => {
    const id = params.id
    const data = await getBanner(id);
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    params: bannerSchema,
    response: {
      200: "banner"
    }
  })

export const bannerLatest = new Elysia()
  .model({
    "banner": withData(
      t.Nullable(bannerPayload)
    )
  })
  .get("/latest", async ({ status }) => {
    const data = await getLatestBanner();
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    response: {
      200: "banner"
    }
  })