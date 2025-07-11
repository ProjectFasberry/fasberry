import { PaymentMeta } from "#/lib/publishers/pub-payment-notify"
import { getNatsConnection } from "#/shared/nats/nats-client"
import { PAYMENT_FIAT_START_SUBJECT } from "#/shared/nats/nats-subjects"
import { paymentFiatMethodSchema } from "@repo/shared/schemas/payment/payment-schema"
import type { z } from "zod/v4"

type CreateFiatOrder = PaymentMeta & {
  type: z.infer<typeof paymentFiatMethodSchema>
}

type CreateFiatOrderResponse = {
  IsSuccess: boolean,
  ErrorCode: number,
  Data: string,
  ErrorMessage?: string
}

export async function createFiatOrder({
  paymentValue, paymentType, nickname, type
}: CreateFiatOrder) {
  const nc = getNatsConnection()

  const payload: CreateFiatOrder = {
    nickname, paymentType, paymentValue: String(paymentValue), type
  }

  const res = await nc.request(
    PAYMENT_FIAT_START_SUBJECT, JSON.stringify(payload), { timeout: 10000 }
  )

  const { IsSuccess, ErrorCode, Data, ErrorMessage } = res.json<CreateFiatOrderResponse>()

  return { isSuccess: IsSuccess, errorCode: ErrorCode, data: Data, errorMessage: ErrorMessage }
}