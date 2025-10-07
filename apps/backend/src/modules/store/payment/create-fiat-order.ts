import { getNats } from "#/shared/nats/client"
import { PAYMENT_FIAT_START_SUBJECT } from "#/shared/nats/subjects"
import { paymentFiatMethodSchema } from "@repo/shared/schemas/payment"
import type { z } from "zod"

type CreateFiatOrder = { nickname: string, paymentValue: string, paymentType: string, type: z.infer<typeof paymentFiatMethodSchema> }

type CreateFiatOrderResponse = {
  IsSuccess: boolean,
  ErrorCode: number,
  Data: string,
  ErrorMessage?: string
}

export async function createFiatOrder({
  paymentValue, paymentType, nickname, type
}: CreateFiatOrder) {
  const nc = getNats()

  const payload: CreateFiatOrder = {
    nickname, paymentType, paymentValue: String(paymentValue), type
  }

  const res = await nc.request(
    PAYMENT_FIAT_START_SUBJECT, JSON.stringify(payload), { timeout: 10000 }
  )

  const { IsSuccess, ErrorCode, Data, ErrorMessage } = res.json<CreateFiatOrderResponse>()

  return { isSuccess: IsSuccess, errorCode: ErrorCode, data: Data, errorMessage: ErrorMessage }
}