import { z } from 'zod';
import { currencyCryptoSchema } from '../../schemas/entities/currencies-schema';
import { donateSchema } from '../../schemas/entities/donate-schema';
import { orderEventPayloadSchema, paymentCurrencySchema, paymentStatusSchema, paymentTypeSchema, paymentValueSchema } from '../../schemas/payment';

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

export type CreateOrderRoutePayload = {
  purchase: {
    uniqueId: string;
  },
  payload: {
    price: {
      BELKOIN: number,
      CHARISM: number,
    }
  }
}

export type OrderEventPayload = z.infer<typeof orderEventPayloadSchema>