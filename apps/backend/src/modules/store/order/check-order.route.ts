import Elysia from "elysia";
import { wrapError } from "#/helpers/wrap-error";
import { payments } from "#/shared/database/payments-db";
import { InvoiceType } from "#/shared/types/payment/payment-types";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { createHmac, createHash } from 'node:crypto';
import { getRedis } from "#/shared/redis/init";
import { getOrderKey, PaymentCacheData } from "./create-crypto-order";
import { logger } from "#/utils/config/logger";
import { CRYPTO_PAY_TESTNET_TOKEN } from "#/shared/env";
import { safeJsonParse } from "#/utils/config/transforms";

type CheckOrderBody = {
  update_id: number,
  payload: InvoiceType,
  request_date: string,
  update_type: string
}

export function validateSignatureCryptoPay(
  body: string,
  resSignature: string
) {
  const secret = createHash('sha256')
    .update(CRYPTO_PAY_TESTNET_TOKEN)
    .digest()

  const hmac = createHmac('sha256', secret)
    .update(body)
    .digest('hex')

  return hmac === resSignature
}

export const checkOrderRoute = new Elysia()
  .post('/process-order', async ({ status, ...ctx }) => {
    const text = ctx.body as string;
    const signature = ctx.headers['crypto-pay-api-signature']

    if (!signature || !text) {
      status(HttpStatusEnum.HTTP_400_BAD_REQUEST);
      return wrapError('Signature or body is required')
    }

    const isValid = validateSignatureCryptoPay(text, signature);

    if (!isValid) {
      status(HttpStatusEnum.HTTP_400_BAD_REQUEST);
      return wrapError('Invalid signature')
    }

    const redis = getRedis()

    const bodyResult = safeJsonParse<CheckOrderBody>(text)

    if (!bodyResult.ok) {
      status(HttpStatusEnum.HTTP_400_BAD_REQUEST);
      return wrapError("Incorrect body")
    }

    const { update_type, payload } = bodyResult.value;

    if (!payload.payload) {
      throw new Error("Payload is not found")
    }

    const payloadResult = safeJsonParse<PaymentCacheData>(payload.payload);

    if (!payloadResult.ok) {
      status(HttpStatusEnum.HTTP_400_BAD_REQUEST);
      return wrapError("Incorrect payload")
    }

    const data = payloadResult.value;

    const uniqueId = data.unique_id;

    if (!uniqueId) {
      throw new Error("Payment is not found")
    }

    if (payload.status === 'expired') {
      await redis.del(getOrderKey(uniqueId))
      logger.success("Payment deleted from redis because is expired", payload.invoice_id)
    }

    if (update_type === 'invoice_paid') {
      const cached = await redis.get(getOrderKey(uniqueId))

      if (!cached) {
        throw new Error("Cached payment is not found")
      }

      const cachedOrderResult = safeJsonParse<PaymentCacheData>(cached);
      
      if (!cachedOrderResult.ok) {
        status(HttpStatusEnum.HTTP_400_BAD_REQUEST)
        return wrapError("Incorrect order data")
      }

      const order = cachedOrderResult.value

      await payments.transaction().execute(async (trx) => {
        const query = await trx
          .insertInto("payments")
          .values({
            ...order,
            status: "succeeded",
          })
          .executeTakeFirst()

        if (!query.numInsertedOrUpdatedRows) {
          logger.success("Payment saved to database", payload.invoice_id)
          throw new Error("Payment is not saved to Database")
        }

        // publishPaymentSuccess()
        // publishPaymentLog({ ...meta, orderId: payload.hash })

        await redis.del(getOrderKey(uniqueId))

        logger.success("Deleted from redis cache. Order", payload.invoice_id)
      })
    }

    return { ok: true }
  }, {
    parse: "text/plain"
  })