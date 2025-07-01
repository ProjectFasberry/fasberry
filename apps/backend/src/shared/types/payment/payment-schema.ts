import { z } from 'zod/v4';
import { donateSchema } from './donate-schema';
import { currencyCryptoSchema, currencyFiatSchema } from './currencies-schema';

export const paymentFiatMethodSchema = z.enum(["creditCard", "sbp"])
export const paymentTypeSchema = z.enum(['donate', 'belkoin', 'charism', 'item', 'event']);
export const paymentCurrencySchema = z.union([currencyFiatSchema, currencyCryptoSchema]);
export const paymentStatusSchema = z.enum(['created', 'received', 'captured', 'cancelled', 'failed']);
export const paymentValueSchema = z.union([donateSchema, z.number(), z.string()]);

export const paymentMetaSchema = z.object({
  nickname: z.string().min(1,
    { error: "Никнейм должен содержать хотя бы 1 символ" }).max(32, { error: "Превышена максимальная длина никнейма" }),
  paymentType: paymentTypeSchema,
  paymentValue: paymentValueSchema,
})

export function paymentTypeValidator({ data, ctx }: {
  data: any,
  ctx: any
}) {
  if (data.paymentType === 'donate' && !donateSchema.safeParse(data.paymentValue).success) {
    ctx.issues.push({
      input: "",
      code: "custom",
      message: `Invalid donate value. Needed: ${donateSchema.options.join(", ")}`
    })
  }

  if (data.currency === 'RUB' && !paymentFiatMethodSchema.safeParse(data.fiatMethod).success) {
    ctx.issues.push({
      input: "",
      code: "custom",
      message: `Invalid fiat method value. Needed: ${paymentFiatMethodSchema.options.join(", ")}`
    })
  }
}

export const createOrderBodySchema = z.intersection(
  z.object({
    // email: z.string().email('Введите корректный адрес электронной почты'),
    privacy: z
      .boolean()
      .refine((value) => value === true, { error: 'Вы должны ознакомиться с правилами!' }),
    currency: paymentCurrencySchema,
    fiatMethod: paymentFiatMethodSchema
  }),
  paymentMetaSchema.check((ctx) => paymentTypeValidator({ data: ctx.value, ctx: ctx.issues }))
)