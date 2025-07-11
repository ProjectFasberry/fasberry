import { PaymentDonateType, PaymentMeta } from "#/lib/publishers/pub-payment-notify";
import { payments } from "#/shared/database/payments-db";

type PaymentDetails =
  | { title: string, price: string, description: string, origin: PaymentDonateType }
  | { title: string }

async function getDonateDetails(value: PaymentDonateType) {
  return payments
    .selectFrom("donate")
    .select(["title", "price", "description", "origin"])
    .where("origin", "=", value)
    .executeTakeFirst()
}

async function getWalletDetails(value: "charism" | "belkoin") {
  return payments
    .selectFrom("economy")
    .select(["title"])
    .where("type", "=", value)
    .executeTakeFirst()
}

export async function getPaymentDetails({ 
  paymentType, paymentValue 
}: Omit<PaymentMeta, "nickname">): Promise<PaymentDetails | null> {
  switch (paymentType) {
    case "donate":
      const query = await getDonateDetails(paymentValue as PaymentDonateType)

      if (!query) {
        return null;
      }

      return query;
    case "belkoin":
    case "charism":
      const walletQuery = await getWalletDetails(paymentType as "charism" | "belkoin")

      if (!walletQuery) {
        return null;
      }

      return { title: walletQuery.title! }
    case "event":
    case "item":
      throw new Error("Not supported payment type")
  }
}