import Elysia, { t } from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { getOrder } from "./order.model";
import { withData } from "#/shared/schemas";

const orderPayload = t.Object({
  unique_id: t.String(),
  asset: t.UnionEnum(["USDT", "TON", "BTC", "ETH", "LTC", "BNB", "TRX", "USDC"]),
  price: t.String(),
  created_at: t.Union([t.Date(), t.String()]),
  status: t.UnionEnum(["canceled", "pending", "succeeded", "waitingForCapture"]),
  payload: t.String(),
  order_id: t.String(),
  invoice_id: t.Number(),
  pay_url: t.String(),
  initiator: t.String(),
  comment: t.Optional(t.String())
})

export const orderRoute = new Elysia()
  .model({
    "order": withData(
      t.Nullable(orderPayload)
    )
  })
  .get("/:id", async ({ status, params }) => {
    const id = params.id;
    const data = await getOrder(id)
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    response: {
      200: "order"
    }
  })