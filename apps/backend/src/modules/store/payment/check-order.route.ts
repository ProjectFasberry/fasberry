import { throwError } from "#/helpers/throw-error";
import { publishPaymentLog } from "#/lib/publishers/pub-payment-log";
import { publishPaymentSuccess } from "#/lib/publishers/pub-payment-success";
import { payments } from "#/shared/database/payments-db";
import { InvoiceType } from "#/shared/types/payment/payment-types";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { paymentMetaSchema } from "@repo/shared/schemas/payment";
import { createHmac, createHash, timingSafeEqual } from 'node:crypto';
import { getRedisClient } from "#/shared/redis/init";
import { getOrderKey, PaymentCacheData } from "./create-crypto-order";
import { logger } from "#/utils/config/logger";

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
    .update(Bun.env.CRYPTO_PAY_TESTNET_TOKEN)
    .digest()

  const hmac = createHmac('sha256', secret)
    .update(body)
    .digest('hex')

  return hmac === resSignature
}

export const checkOrderRoute = new Elysia()
  .post('/process-order', async (ctx) => {
    const text = ctx.body as string;
    console.log(text)

    const signature = ctx.headers['crypto-pay-api-signature']

    console.log(signature)

    if (!signature || !text) {
      return ctx.status(HttpStatusEnum.HTTP_400_BAD_REQUEST, throwError('Signature or body is required'))
    }

    const isValid = validateSignatureCryptoPay(text, signature);

    if (!isValid) {
      return ctx.status(HttpStatusEnum.HTTP_400_BAD_REQUEST, throwError('Invalid signature'))
    }

    try {
      const redis = getRedisClient()

      const body: CheckOrderBody = JSON.parse(text)
      console.log(body)

      const { update_type, payload } = body;

      if (!payload.payload) {
        throw new Error("Payload is not found")
      }

      const data: PaymentCacheData = JSON.parse(payload.payload)
      console.log(data)

      const uniqueId = data.unique_id;
      console.log(uniqueId)

      if (!uniqueId) {
        throw new Error("Payment is not found")
      }

      if (payload.status === 'expired') {
        await redis.del(getOrderKey(uniqueId))
        logger.success("Payment deleted from redis because is expired", payload.invoice_id)
      }

      if (update_type === 'invoice_paid') {
        const cached = await redis.get(getOrderKey(uniqueId))
        console.log(cached)

        if (!cached) {
          throw new Error("Cached payment is not found")
        }

        const parsedCached: PaymentCacheData = JSON.parse(cached)
        console.log(parsedCached)

        await payments.transaction().execute(async (trx) => {
          const query = await trx
            .insertInto("payments")
            .values({
              ...parsedCached,
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

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { ok: true })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  }, {
    parse: "text/plain"
  })

// validate for arc pay
// export function validateSignatureArcPay(requestedSignature: string, payload: string) {
//   const expectedSignature = new Bun
//     .CryptoHasher('sha256', ARC_PAY_TOKEN)
//     .update(payload)
//     .digest('hex');

//   if (!timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(requestedSignature))) {
//     throw new Error('Invalid signature');
//   }
// }