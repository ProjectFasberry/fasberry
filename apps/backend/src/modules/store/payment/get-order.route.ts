import { PaymentCryptoTonStatus, PaymentStatus } from "@repo/shared/types/db/payments-database-types";
import Elysia from "elysia";
import { z } from "zod/v4";
import { getPaymentData } from "./queries/get-payment-data";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { throwError } from "#/helpers/throw-error";

const getOrderRouteSchema = z.object({
  type: z.enum(["crypto", "fiat"])
})

const statusMap: Record<PaymentCryptoTonStatus | PaymentStatus, "success" | "pending" | "canceled" | "error"> = {
  "succeeded": "success",
  "failed": "error",
  "captured": "pending",
  "pending": "pending",
  "waitingForCapture": "pending",
  "canceled": "canceled",
  "received": "success",
  "created": "pending",
  "cancelled": "canceled",
}

export const getOrderRoute = new Elysia()
  .get('/get-order/:id', async (ctx) => {
    const id = ctx.params.id
    const { type } = getOrderRouteSchema.parse(ctx.query)

    try {
      const res = await getPaymentData({ orderId: id, type  })

      if (!res) {
        return ctx.status(HttpStatusEnum.HTTP_400_BAD_REQUEST, throwError("Payment not found"))
      }

      const isExpired = res.created_at! <= new Date(Date.now() - 10 * 60 * 1000);

      const payment = {
        ...res,
        status: isExpired ? "canceled" : statusMap[res.status]
      }

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: payment })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  })