import { getNatsConnection } from "#/shared/nats/nats-client"
import { getPaymentDetails } from "#/utils/payment/get-payment-details"
import { PaymentMeta } from "./pub-payment-notify"

export type PaymentReceived = {
  item: string,
  nickname: string,
  orderId: string
}

type PublishPaymentLog = PaymentMeta & { orderId: string }

export const publishPaymentLog = async (data: PublishPaymentLog) => {
  const nc = getNatsConnection()

  const paymentDetails = await getPaymentDetails(data)

  let item: string = ""

  if (data.paymentType === "donate") {
    item = `привилегия ${paymentDetails?.title}`
  } else if (data.paymentType === "charism" || data.paymentType === "belkoin") {
    item = `валюта ${paymentDetails?.title} в кол-ве ${data.paymentValue}`
  }

  const payload: PaymentReceived = {
    item,
    nickname: data.nickname,
    orderId: data.orderId
  }

  return nc.publish("test", JSON.stringify(payload))
}