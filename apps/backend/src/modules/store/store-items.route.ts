import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { StoreItemsPayload } from "@repo/shared/types/entities/store";
import { getStoreItems, storeListSchema } from "./store.model";

export const storeItems = new Elysia()
  .get("/items", async ({ status, query }) => {
    const data: StoreItemsPayload = await getStoreItems(query);
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    query: storeListSchema
  })