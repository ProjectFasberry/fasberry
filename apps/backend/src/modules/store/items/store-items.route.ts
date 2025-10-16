import Elysia from "elysia";
import { StoreItemsPayload } from "@repo/shared/types/entities/store";
import { getStoreItems, storeListSchema } from "./store-items.model";

export const storeItems = new Elysia()
  .get("/items", async ({ query }) => {
    const data: StoreItemsPayload = await getStoreItems(query);
    return { data }
  }, {
    query: storeListSchema
  })