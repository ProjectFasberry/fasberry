import { getNatsConnection } from "#/shared/nats/nats-client"
import { PAYMENT_SUCCESS_SUBJECT } from "#/shared/nats/nats-subjects"
import { PaymentMeta } from "./pub-payment-notify"

export function publishPaymentSuccess(meta: PaymentMeta) {
  const nc = getNatsConnection()

  const payload = JSON.stringify({
    nickname: meta.nickname,
    paymentType: meta.paymentType,
    paymentValue: String(meta.paymentValue),
  })

  return nc.publish(PAYMENT_SUCCESS_SUBJECT, payload)
}