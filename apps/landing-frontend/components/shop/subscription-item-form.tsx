import Link from 'next/link';
import { Typography } from '@repo/landing-ui/src/typography';
import { Button } from '@repo/landing-ui/src/button';
import { useState } from 'react';
import { toast } from 'sonner';
import { ShopPrice } from './shop-price';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { PAYMENT_STATUS_QUERY_KEY } from './shop-payment-status';
import ky, { HTTPError } from 'ky';
import { z, ZodError } from 'zod/v4';
import { shopItemQuery } from './shop';
import { paymentCurrencySchema, paymentFiatMethodSchema } from '@repo/shared/constants/currencies';
import { PAYMENTS_API } from '@repo/shared/constants/api';

function parseZodErrorMessages(error: ZodError): string[] {
  return error.issues.map(issue => issue.message);
}

const donateSchema = z.enum(['authentic', 'arkhont', 'loyal']);
const paymentTypeSchema = z.enum(['donate', 'belkoin', 'charism', 'item', 'event']);
const paymentValueSchema = z.union([donateSchema, z.number(), z.string()]);

const paymentMetaSchema = z.object({
  nickname: z.string().min(1,
    { error: "Никнейм должен содержать хотя бы 1 символ" }).max(32, { error: "Превышена максимальная длина никнейма" }),
  paymentType: paymentTypeSchema,
  paymentValue: paymentValueSchema,
})

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

export const CREATE_PAYMENT_MUTATION_KEY = ["shop", 'create-payment-mutation'];

export async function createPayment(payment: z.infer<typeof createOrderBodySchema>) {
  try {
    const res = await PAYMENTS_API("create-order", { json: { payment } })
    const data = await res.json<{ data: { url: string, orderId: string } } | { error: string }>()

    if ("error" in data) {
      return { error: data.error }
    }

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

type PaymentFields = z.infer<typeof createOrderBodySchema>;

export const useCreatePayment = () => {
  const qc = useQueryClient();

  const createPaymentMutation = useMutation({
    mutationKey: CREATE_PAYMENT_MUTATION_KEY,
    mutationFn: async (values: PaymentFields) => createPayment(values),
    onSuccess: async (data, variables) => {
      if (!data || "error" in data) {
        qc.setQueryData(PAYMENT_STATUS_QUERY_KEY, { type: "error" });

        toast.error(data.error);
      }

      if ("data" in data) {
        qc.setQueryData(PAYMENT_STATUS_QUERY_KEY, {
          current: data.data.orderId,
          status: "pending",
          type: "created",
          url: data.data.url,
          isOpened: true,
          paymentType: variables.currency === 'RUB' ? "fiat" : "crypto"
        })
      }
    },
    onError: e => {
      throw new Error(e.message);
    }
  });

  return { createPaymentMutation };
};

export const SubscriptionItemForm = () => {
  const { data: shopItemState } = shopItemQuery();
  const { createPaymentMutation } = useCreatePayment();
  const [privacy, setPrivacy] = useState<boolean>(false);

  const isValid = shopItemState
    ? shopItemState.nickname && shopItemState.currency && shopItemState.paymentValue && shopItemState.paymentType && privacy
    : false;

  const onSubmit = async () => {
    if (!shopItemState || !shopItemState.nickname || !shopItemState.paymentValue || !shopItemState.paymentType) return;

    if (!privacy) {
      return toast.error("Вы не приняли условия")
    }

    await createPaymentMutation.mutateAsync({
      nickname: shopItemState.nickname,
      paymentType: shopItemState.paymentType,
      paymentValue: shopItemState.paymentValue,
      currency: shopItemState.currency,
      privacy: privacy,
      fiatMethod: shopItemState.fiatMethod ?? "creditCard"
    });
  };

  return (
    <div
      className="flex flex-col justify-between gap-y-6 pt-2"
    >
      {/* <div className="flex flex-col gap-y-2">
        <div className="flex items-start gap-x-2">
          <Typography
            text_color="adaptiveWhiteBlack"
            className="text-[14px] tracking-tight leading-3 lg:text-[16px] break-words"
          >
            Почта
          </Typography>
        </div>
        <Input
          className="px-4"
          placeholder="Почта"
          {...register('email')}
        />
        {errors.email && <ErrorMessage message={errors.email.message} />}
      </div> */}
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center gap-2">
          <label
            onClick={() => setPrivacy(!privacy)}
            htmlFor="privacy"
            className="flex items-center cursor-pointer relative"
          >
            <input
              id="privacy"
              type="checkbox"
              className="peer h-6 w-6 cursor-pointer transition-all appearance-none
                  rounded shadow hover:shadow-md border-[2px]
                  border-neutral-600 bg-neutral-700 checked:bg-neutral-900 checked:border-black"
            />
            <span
              className="absolute text-white opacity-0 peer-checked:opacity-100
               top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </span>
          </label>
          <label htmlFor="privacy" className="w-full select-none">
            <Typography className="text-[14px] tracking-tight leading-3 lg:text-[16px] break-words">
              Я согласен с&nbsp;
              <Link href="/rules" target="_blank" className="text-red">
                правилами&nbsp;
              </Link>
              проекта.
            </Typography>
          </label>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row items-center gap-2 w-full">
        <div className="flex items-center gap-2 justify-center bg-neutral-600/40 p-2 w-full lg:w-1/3 rounded-lg">
          <Typography className='text-[18px]'>
            Итого:
          </Typography>
          <ShopPrice />
        </div>
        <Button
          type="submit"
          disabled={!isValid}
          onClick={() => onSubmit()}
          className="py-2 w-full lg:w-2/3 rounded-lg group hover:bg-[#05b458] bg-[#088d47] hover:duration-300
					 duration-100 ease-in-out backdrop-filter backdrop-blur-lg"
        >
          <Typography className="text-lg text-white">
            Купить
          </Typography>
        </Button>
      </div>
    </div>
  );
};