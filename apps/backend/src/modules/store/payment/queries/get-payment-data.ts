import { payments } from "#/shared/database/payments-db"

type GetPaymentData = {
  orderId: string,
  type: "crypto" | "fiat"
}

export async function getPaymentData({ orderId, type }: GetPaymentData) {
  switch (type) {
    case "fiat":
      return payments
        .selectFrom("payments_fiat")
        .select(["created_at", "payment_type", "payment_value", "nickname", "orderid", "status"])
        .where("orderid", "=", orderId)
        .executeTakeFirst()
    case "crypto":
      return payments
        .selectFrom("payments_crypto")
        .select(["created_at", "payment_type", "payment_value", "nickname", "orderid", "status"])
        .where("orderid", "=", orderId)
        .executeTakeFirst()
    default:
      return null
  }
}