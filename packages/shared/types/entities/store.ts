import { STORE_TYPES, storeItemSchema } from "../../schemas/payment"
import { z } from "zod/v4"

export type StoreItem = z.infer<typeof storeItemSchema> & {
  type: typeof STORE_TYPES[number] | string
}