import { getNatsConnection } from "#/shared/nats/nats-client"
import { z } from 'zod/v4';
import { currencyCryptoSchema } from "@repo/shared/schemas/entities/currencies-schema.js";
import { paymentCurrencySchema, paymentStatusSchema, paymentTypeSchema, paymentValueSchema } from "@repo/shared/schemas/payment/payment-schema";

export const donateSchema = z.enum(["arkhont", "authentic", "loyal", "default", "dev", "helper", "moder"])

export type PaymentCryptoCurrency = z.infer<typeof currencyCryptoSchema>
export type PaymentDonateType = z.infer<typeof donateSchema>
export type PaymentCurrency = z.infer<typeof paymentCurrencySchema>
export type PaymentResponseStatus = z.infer<typeof paymentStatusSchema>
export type PaymentType = z.infer<typeof paymentTypeSchema>
export type PaymentValueType = z.infer<typeof paymentValueSchema>

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

  // todo: replace to real subjct
  return nc.publish("test", payload)
}