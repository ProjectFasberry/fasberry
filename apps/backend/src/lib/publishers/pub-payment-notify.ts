import { getNatsConnection } from "#/shared/nats/nats-client"
import { z } from 'zod/v4';
import { currencyCryptoSchema } from "@repo/shared/schemas/entities/currencies-schema.js";
import { paymentTypeSchema } from "@repo/shared/schemas/payment";
import { donateSchema } from "@repo/shared/schemas/entities/donate-schema";

export type PaymentCryptoCurrency = z.infer<typeof currencyCryptoSchema>
export type PaymentDonateType = z.infer<typeof donateSchema>
export type PaymentType = z.infer<typeof paymentTypeSchema>

export type PaymentMeta = {
  nickname: string,
  paymentType: PaymentType,
  paymentValue: PaymentDonateType | string | number
}

export function publishPaymentNotify({
  nickname, paymentType, paymentValue
}: PaymentMeta) {
  const nc = getNatsConnection()

  const payload = JSON.stringify({
    type: "payment",
    payload: { nickname, paymentType, paymentValue }
  })

  return nc.publish("test", payload)
}