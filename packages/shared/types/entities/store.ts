import { STORE_TYPES, storeItemSchema } from "../../schemas/payment"
import { z } from "zod"
import { JsonValue } from "../db/auth-database-types"

export type StoreItem = z.infer<typeof storeItemSchema> & {
  type: typeof STORE_TYPES[number] | string
}

export type StoreItemsPayload = {
  data: StoreItem[],
  meta: PaginatedMeta
}

export type CartFinalPrice = {
  CHARISM: number,
  BELKOIN: number
}

export type CartItem = {
  imageUrl: string;
  price: number;
  recipient: string;
  selected: boolean;
  quantity: number;
  id: number;
  value: string;
  type: string;
  command: string | null;
  currency: string;
  description: JsonValue;
  summary: string;
  title: string;
}

export type CartPayload = {
  products: CartItem[],
  price: CartFinalPrice
}

export type BalancePayload = CartFinalPrice