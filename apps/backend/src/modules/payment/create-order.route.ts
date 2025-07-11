import Elysia, { t } from "elysia";
import { createFiatOrder } from "./orders/create-fiat-order";
import { createCryptoOrder } from "./orders/create-crypto-order";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { throwError } from "#/helpers/throw-error";
import { validateAvailabilityByCurrency } from "./validators/validate-availability-by-currency";
import { currencyCryptoSchema, currencyFiatSchema } from "@repo/shared/schemas/entities/currencies-schema";
import { createOrderBodySchema } from "@repo/shared/schemas/payment/payment-schema";

function getParamFromUrl(url: string, param: string): string | null {
  const parsedUrl = new URL(url);
  return parsedUrl.searchParams.get(param);
}

// todo: replace to typebox schema validation
export const createOrderRoute = new Elysia()
  .post('/create-order', async (ctx) => {
    const json = ctx.body;

    const {
      paymentValue, paymentType, currency, nickname, fiatMethod, privacy
    } = createOrderBodySchema.parse(json);

    if (!privacy) {
      return ctx.status(HttpStatusEnum.HTTP_400_BAD_REQUEST, throwError("You did not agree to the terms"))
    }

    const isAvailable = await validateAvailabilityByCurrency(currency);

    if (!isAvailable) {
      return ctx.status(HttpStatusEnum.HTTP_400_BAD_REQUEST, throwError("Покупка за эту валюту не доступна"))
    }

    const { success: isCrypto, data: cryptoCurrency } = currencyCryptoSchema.safeParse(currency);
    const { success: isFiat, data: fiatCurrency } = currencyFiatSchema.safeParse(currency);

    try {
      if (isCrypto) {
        const payment = await createCryptoOrder({
          nickname, paymentValue, paymentType, currency: cryptoCurrency
        });

        if (!payment) {
          return ctx.status(HttpStatusEnum.HTTP_400_BAD_REQUEST, throwError("Error creating payment"))
        }

        return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: payment })
      }

      if (isFiat && fiatCurrency) {
        const { data: url, isSuccess } = await createFiatOrder({
          nickname, paymentValue, paymentType, type: fiatMethod
        })

        if (!isSuccess || !url) {
          return ctx.status(HttpStatusEnum.HTTP_400_BAD_REQUEST, throwError("Error creating payment"));
        }

        const orderId = getParamFromUrl(url, "orderId");

        if (!orderId) {
          return ctx.status(HttpStatusEnum.HTTP_400_BAD_REQUEST, throwError("Error creating payment"));
        }

        return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: { url, orderId } })
      }

      return ctx.status(HttpStatusEnum.HTTP_400_BAD_REQUEST, throwError("Error creating payment"))
    } catch (e) {
      console.error(e)
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  }, {
    parse: "json"
  });