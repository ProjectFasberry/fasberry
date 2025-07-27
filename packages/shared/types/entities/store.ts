import { JsonValue } from "../db/auth-database-types"

export type  StoreItem = {
  id: number,
  title: string,
  description: JsonValue | null,
  imageUrl: string,
  type: "donate" | "event" | string,
  currency: string,
  price: number,
  summary: string
}