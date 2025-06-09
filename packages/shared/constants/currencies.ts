import { z } from 'zod/v4';

export const currencyCryptoSchema = z.enum(["USDT", "TON", "BTC", "ETH", "LTC", "BNB", "TRX", "USDC",]);

export type PaymentCryptoCurrency = z.infer<typeof currencyCryptoSchema>

export const PAYMENT_CURRENCIES_MAPPING: Record<PaymentCryptoCurrency, string> = {
  "BTC": "bitcoin",
  "ETH": "ethereum",
  'USDT': 'tether',
  'TON': 'the-open-network',
  "TRX": "tron",
  "USDC": "usd-coin",
  "BNB": "binancecoin",
  "LTC": "litecoin",
};

export type PaymentCurrency = "USDT" | "TON" | "BTC" | "ETH" | "LTC" | "BNB" | "TRX" | "USDC" | "RUB"

export type CurrencyString = typeof PAYMENT_CURRENCIES_MAPPING[keyof typeof PAYMENT_CURRENCIES_MAPPING];

export const currencyFiatSchema = z.enum(['RUB']);
export const paymentCurrencySchema = z.union([currencyFiatSchema, currencyCryptoSchema]);
export const paymentFiatMethodSchema = z.enum(["creditCard", "sbp"])