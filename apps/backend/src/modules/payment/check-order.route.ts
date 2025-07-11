import { throwError } from "#/helpers/throw-error";
import { publishPaymentLog } from "#/lib/publishers/pub-payment-log";
import { publishPaymentSuccess } from "#/lib/publishers/pub-payment-success";
import { payments } from "#/shared/database/payments-db";
import { paymentMetaSchema } from "#/shared/types/payment/payment-schema";
import { InvoiceType } from "#/shared/types/payment/payment-types";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { validateSignatureCryptoPay } from "./validators/validate-signature";

type CheckOrderBody = {
  update_id: number,
  payload: InvoiceType,
  request_date: string,
  update_type: string
}

export const checkOrderRoute = new Elysia()
  .post('/check-order', async (ctx) => {
    const text = await ctx.request.text()
    const body = ctx.body as CheckOrderBody

    const signature = ctx.headers['crypto-pay-api-signature']

    if (!signature || !text) {
      return ctx.status(HttpStatusEnum.HTTP_400_BAD_REQUEST, throwError('Signature or body is required'))
    }

    const isValid = validateSignatureCryptoPay(text, signature);

    if (!isValid) {
      return ctx.status(HttpStatusEnum.HTTP_400_BAD_REQUEST, throwError('Invalid signature'))
    }

    try {
      const { update_type, payload } = body;

      if (payload.status === 'expired') {
        await payments
          .updateTable("payments_crypto")
          .set({ status: "cancelled" })
          .where("orderid", "=", payload.hash)
          .executeTakeFirstOrThrow()
      }

      if (update_type === 'invoice_paid') {
        const meta = paymentMetaSchema.parse(
          JSON.parse(payload.payload ? payload.payload : "")
        )

        publishPaymentSuccess(meta)
        publishPaymentLog({ ...meta, orderId: payload.hash })

        await payments
          .updateTable("payments_crypto")
          .set({ status: "received" })
          .where("orderid", "=", payload.hash)
          .executeTakeFirstOrThrow()
      }

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { ok: true })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  }, {
    parse: "json"
  });