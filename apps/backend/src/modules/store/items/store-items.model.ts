import { general } from "#/shared/database/main-db";
import { metaSchema } from "#/shared/schemas";
import { getDirection } from "#/utils/config/paginate";
import { wrapMeta } from "#/utils/config/transforms";
import { definePrice, processImageUrl } from "#/utils/store/store-transforms";
import { GAME_CURRENCIES } from "@repo/shared/schemas/payment";
import { StoreItemsPayload } from "@repo/shared/types/entities/store";
import { executeWithCursorPagination } from "kysely-paginate";
import z from "zod";

const STORE_LIST_TYPE = ["all", "donate", "event"] as const;

export const storeListSchema = z.intersection(
  metaSchema.pick({ endCursor: true }),
  z.object({
    type: z.enum(STORE_LIST_TYPE).optional().default("all"),
    wallet: z.enum([...GAME_CURRENCIES, "ALL"]).default("ALL"),
  })
)

export async function getStoreItems(
  { wallet, type, endCursor }: z.infer<typeof storeListSchema>
): Promise<StoreItemsPayload> {
  let storeQuery = general
    .selectFrom("store_items")
    .select([
      "id",
      "title",
      "description",
      "price",
      "imageUrl",
      "type",
      "currency",
      "summary",
      "command",
      "value",
      "content"
    ])
    .orderBy("id", "asc")

  if (wallet !== 'ALL') {
    storeQuery = storeQuery.where('currency', "=", wallet)
  }

  const queryType = STORE_LIST_TYPE.includes(type) ? type : "all"

  if (queryType === 'all') {
    storeQuery = storeQuery.where("type", "in", STORE_LIST_TYPE)
  } else {
    storeQuery = storeQuery.where("type", "=", queryType)
  }

  const direction = getDirection(true)

  const result = await executeWithCursorPagination(storeQuery, {
    after: endCursor,
    perPage: 32,
    fields: [
      { key: "id", expression: "id", direction }
    ],
    parseCursor: (cursor) => ({
      id: Number(cursor.id)
    })
  })

  const data = result.rows.map((item) => {
    const imageUrl = processImageUrl(item.imageUrl)

    const updated = {
      ...item,
      imageUrl,
      price: definePrice(item.currency, item.price),
    }

    return updated
  })

  return {
    data,
    meta: wrapMeta(result)
  }
}