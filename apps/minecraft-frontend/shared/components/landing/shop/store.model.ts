import { toast } from 'sonner';
import { reatomAsync, reatomResource, withCache, withDataAtom, withStatusesAtom } from "@reatom/async"
import { atom } from "@reatom/core"
import { sleep, withReset } from "@reatom/framework"
import { CURRENCIES_API, FORUM_SHARED_API, PAYMENTS_API } from "@repo/shared/constants/api"
import { CurrencyString, PaymentCurrency, paymentCurrencySchema, paymentFiatMethodSchema } from "@repo/shared/constants/currencies"
import ky, { HTTPError } from "ky"
import { z, ZodError } from 'zod/v4';

const ORDERS_API = ky.extend({
  prefixUrl: "https://api.fasberry.su/payment",
  credentials: "include"
})

const COINGECKO_API = ky.extend({ prefixUrl: "https://api.coingecko.com/api" })

export type GetOrderRequest = any
export type GetOrderResponse = any

export type PaymentResult = {
  current: string,
  paymentType: GetOrderRequest["query"]["type"],
  status: GetOrderResponse["data"]["status"],
  url: string
}

export type PaymentResultType = "created" | "error"

type Currency = {
  id: string,
  value: string,
  imageUrl: string,
  title: string,
  status: string,
  isAvailable: boolean
}

type PaymentOrder = {
  status: "success" | "error" | "canceled" | "pending";
  nickname: string;
  created_at: Date | null;
  orderid: string;
  payment_type: string;
  payment_value: string;
}

type PaymentValueType = string | number
type PaymentType = "donate" | "belkoin" | "charism" | "item" | "event"

export type StoreItem = Partial<{
  paymentType: PaymentType
  paymentValue: PaymentValueType
}> & {
  currency: PaymentCurrency,
  fiatMethod: "card" | "sbp",
  category: "donate" | "wallet" | "events"
}

type GetDonatesRequest = {

}

export type Donates = {
  imageUrl: string;
  id: string;
  created_at: string;
  description: string;
  title: string;
  origin: string;
  price: string;
  rating: string;
  commands: string[],
  forum: string[] | null
}

export type Wallets = {
  type: string;
  value: number;
}

export type Events = {
  type: string;
  title: string;
  description: string;
  wallet: string;
  price: number;
}

type PaymentAction = z.infer<typeof createOrderBodySchema>;

const donateSchema = z.enum(['authentic', 'arkhont', 'loyal']);
const paymentTypeSchema = z.enum(['donate', 'belkoin', 'charism', 'item', 'event']);
const paymentValueSchema = z.union([donateSchema, z.number(), z.string()]);

const paymentMetaSchema = z.object({
  nickname: z.string().min(1,
    { error: "Никнейм должен содержать хотя бы 1 символ" }).max(32, { error: "Превышена максимальная длина никнейма" }),
  paymentType: paymentTypeSchema,
  paymentValue: paymentValueSchema,
})

const createOrderBodySchema = z.intersection(
  z.object({
    privacy: z
      .boolean()
      .refine((value) => value === true, { error: 'Вы должны ознакомиться с правилами!' }),
    currency: paymentCurrencySchema,
    fiatMethod: paymentFiatMethodSchema
  }),
  paymentMetaSchema.check((ctx) => paymentTypeValidator({ data: ctx.value, ctx: ctx.issues }))
)

const storeItemInitial: StoreItem = {
  currency: "RUB",
  category: "donate",
  fiatMethod: "card"
}

export const paymentResult = atom<PaymentResult | null>(null, "paymentResult").pipe(withReset())
export const paymentResultType = atom<PaymentResultType | null>(null, "paymentResultType").pipe(withReset())
export const paymentResultDialogIsOpen = atom(false, "paymentResultDialogIsOpen")

paymentResult.onChange((ctx, state) => console.log("paymentResult", state))
paymentResultType.onChange((ctx, state) => console.log("paymentResultType", state))
paymentResultDialogIsOpen.onChange((ctx, state) => console.log("paymentResultDialogIsOpen", state))

export const storeTargetNickname = atom<string>("", "storeTargetNickname")
export const storeItem = atom<StoreItem>(storeItemInitial, "storeItem").pipe(withReset())

paymentResult.onChange((ctx, target) => {
  if (!target) return;

  if (target.status === 'success' || target.status === 'canceled') {
    paymentResult.reset(ctx)
    paymentResultType.reset(ctx)
    paymentResultDialogIsOpen(ctx, false)
  }
})

export const paymentStatusAction = reatomAsync(async (
  ctx, values: Pick<PaymentResult, "current" | "paymentType">
) => {
  await sleep(2000)
  return await ctx.schedule(() => getPaymentStatus(values.current, values.paymentType))
}, {
  name: "paymentStatusAction",
  onFulfill: (ctx, res) => {
    if (!res) return;

    if ("error" in res) {
      return paymentResult(ctx, (state) => {
        if (!state) return null;

        return { ...state, status: 'error' }
      })
    }

    paymentResult(ctx, (state) => {
      if (!state) return null;

      return { ...state, status: res.status }
    })
  }
}).pipe(withStatusesAtom())

export const donatesResource = reatomAsync(async (ctx, type: "donate" | "wallet" | "events") => {
  return await ctx.schedule(() => getDonates({ type }))
}, "donatesResource").pipe(withStatusesAtom(), withCache(), withDataAtom())

export const priceByCurrencyAction = reatomAsync(async (ctx, currency: string) => {
  if (currency === "RUB") return;

  return await ctx.schedule(async () => {
    const res = await getCurrencyPriceByRub(currency)

    if (Object.keys(res).length === 0) return null;

    return res
  })
}, {
  name: "priceByCurrencyAction"
}).pipe(withDataAtom(), withStatusesAtom())

export const currenciesResource = reatomResource(async (ctx) => {
  return await ctx.schedule(() => getCurrencies())
}, "currenciesResource").pipe(withStatusesAtom(), withCache(), withDataAtom())

const createPaymentActionVariables = atom<PaymentAction | null>(null)

export const createPaymentAction = reatomAsync(async (ctx) => {
  const { currency, fiatMethod, paymentType, paymentValue } = ctx.get(storeItem)
  const nickname = ctx.get(storeTargetNickname)

  console.log(nickname, ctx.get(storeItem))

  if (!paymentType || !paymentValue) return; 

  const values: PaymentAction = { 
    currency, fiatMethod, nickname, paymentType, paymentValue, privacy: true
  }

  createPaymentActionVariables(ctx, values)

  return await ctx.schedule(() => createPayment(values))
}, {
  name: "createPaymentAction",
  onFulfill: (ctx, res) => {
    if (!res) return;

    if ("error" in res) {
      paymentResultType(ctx, "error");

      toast.error(res.error);
      return;
    }

    const variables = ctx.get(createPaymentActionVariables)
    if (!variables) return;

    if ("data" in res) {
      paymentResult(ctx, {
        current: res.data.orderId,
        status: "pending",
        url: res.data.url,
        paymentType: variables.currency === 'RUB' ? "fiat" : "crypto"
      })

      paymentResultType(ctx, "created")
      paymentResultDialogIsOpen(ctx, true)
    }
  }
}).pipe(withStatusesAtom())

async function createPayment(payment: z.infer<typeof createOrderBodySchema>) {
  try {
    const res = await PAYMENTS_API.post("create-order", { json: { payment } })
    const data = await res.json<{ data: { url: string, orderId: string } } | { error: string }>()

    if ("error" in data) return { error: data.error }

    return data
  } catch (e) {
    if (e instanceof HTTPError) {
      if (e instanceof ZodError) {
        const errorBody = await e.response.json<{ error: ZodError }>();
        return { error: parseZodErrorMessages(errorBody.error).join(", ") }
      }

      const { error } = await e.response.json<{ error: string }>();
      return { error }
    }
    throw e;
  }
}

async function getCurrencyPriceByRub<T extends CurrencyString>(convertedCurrency: T): Promise<{
  [key in T]: { rub: number }
}> {
  // @ts-expect-error
  const currencyId = PAYMENT_CURRENCIES_MAPPING[convertedCurrency] as string

  try {
    const params = {
      "ids": currencyId, "vs_currencies": "rub"
    }

    return await COINGECKO_API("v3/simple/price", { searchParams: params })
      .json<{ [key in T]: { rub: number } }>();
  } catch (e) {
    throw e
  }
}

async function getPaymentStatus(id: string, type: PaymentResult["paymentType"]) {
  const res = await ORDERS_API(`get-order/${id}`, { searchParams: { type } })
  const data = await res.json<{ data: PaymentOrder } | { error: string }>()
  if (!data || "error" in data) return { error: data.error };
  return data.data;
}

async function getCurrencies() {
  const res = await CURRENCIES_API("get-currencies")
  const data = await res.json<{ data: Array<Currency> } | { error: string }>()
  if ("error" in data) return null
  return data.data
}

export async function getDonates(args: GetDonatesRequest) {
  const res = await FORUM_SHARED_API("get-donates", { searchParams: args });
  const data = await res.json<{ data: Array<unknown> } | { error: string }>();
  if ("error" in data) return null;
  return data.data.length > 0 ? data.data : null
}

export function validateNumber(input: string): number | null {
  const num = Number(input);
  return Number.isFinite(num) ? num : null;
};

function parseZodErrorMessages(error: ZodError): string[] {
  return error.issues.map(issue => issue.message);
}

function paymentTypeValidator({ data, ctx }: {
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