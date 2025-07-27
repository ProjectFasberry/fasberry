import { PaymentCryptoCurrency, PaymentDonateType, PaymentMeta } from "#/lib/publishers/pub-payment-notify";
import { CRYPTO_PAY_API } from "#/shared/api/crypto-api";
import { main } from "#/shared/database/main-db";
import { ExchangeRate } from "#/shared/types/payment/payment-types";

type GetItemPrice = {
  currency: PaymentCryptoCurrency
  meta: Omit<PaymentMeta, "nickname">
}

function getDiff(rubPrice: number, exchangeRate: number): number {
  const priceInTargetCurrency = rubPrice / exchangeRate;
  return parseFloat(priceInTargetCurrency.toFixed(8));
}

async function getDonatePrice(id: number) {
  return main
    .selectFrom("store_items")
    .select("price")
    .where("id", "=", id)
    .where("type", "=", "donate")
    .executeTakeFirst()
}

async function getWalletPrice(value: "charism" | "belkoin") {
  return main
    .selectFrom("store_economy")
    .select("value")
    .where("type", "=", value)
    .executeTakeFirst()
}

export async function getItemPrice({  meta, currency }: GetItemPrice): Promise<number> {
  let rubPrice: number | null = null;

  const { paymentType, paymentValue } = meta;

  if (paymentType === "donate") {
    // todo: replace 1 to real value
    const donateQuery = await getDonatePrice(1)

    if (!donateQuery) {
      throw new Error("Item not found")
    }

    rubPrice = Number(donateQuery.price);
  } else if (paymentType === "charism" || paymentType === "belkoin") {
    const walletQuery = await getWalletPrice(paymentType as "charism" | "belkoin")

    if (!walletQuery) {
      throw new Error("Item not found")
    }

    rubPrice = Number(paymentValue) * Number(walletQuery.value)
  } else if (paymentType === 'event') {
    throw new Error("Not supported payment type")
  } else if (paymentType === 'item') {
    throw new Error("Not supported payment type")
  }

  if (!rubPrice) {
    throw new Error("Invalid price")
  }

  const exchangeRate = await CRYPTO_PAY_API
    .get("getExchangeRates")
    .json<{ ok: boolean, result: ExchangeRate[] }>()

  const selectedCurrency = exchangeRate.result.find(
    d => d.source === currency && d.target === 'RUB'
  )

  if (!selectedCurrency) {
    throw new Error("Currency not found")
  }

  const price = getDiff(rubPrice, Number(selectedCurrency.rate))

  return price;
}