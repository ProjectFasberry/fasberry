import { getStaticObject } from "#/helpers/volume";
import { GAME_CURRENCIES, GameCurrency } from "#/modules/store/store-items.route";
import { main } from "#/shared/database/main-db";
import { getRedisClient } from "#/shared/redis/init";
import { ExchangeRate } from "#/shared/types/payment/payment-types";
import { EXCHANGE_RATES_KEY } from "../workers/currencies";

export function processImageUrl(target?: string | null) {
  if (target) {
    if (target.includes("https://")) {
      return target;
    }

    return getStaticObject(target)
  }

  return getStaticObject("icons/adventure_icon.png")
}

// RUB is the base currency for all non-game items
const CURRENCIES_TRANSFORMS: Record<string, (target: string) => number> = ({
  "RUB": (target: string) => Number(target) / 100, 
  "BELKOIN": (target: string) => Number(target),
  "CHARISM": (target: string) => Number(target),
})

export function definePrice(
  currency: string, 
  price: string
): number {
  if (typeof price !== "string") {
    throw new Error(`Price must be a string, got ${typeof price}`);
  }

  const transform = CURRENCIES_TRANSFORMS[currency];

  if (!transform) {
    console.warn(`[definePrice] Unknown currency "${currency}", treating as RUB`);
    return Number(price) / 100;
  }

  const value = transform(price);

  if (isNaN(value) || !isFinite(value)) {
    throw new Error(`Invalid transformed price for currency "${currency}": ${price}`);
  }

  return value;
}

export function convertRubToTarget(rubPrice: number, exchangeRate: number): number {
  const priceInTargetCurrency = rubPrice / exchangeRate;

  return parseFloat(
    priceInTargetCurrency.toFixed(8)
  );
}

export type StorePrice = {
  REAL: number, BELKOIN: number, CHARISM: number
}

export async function defineGlobalPrice(
  currentCurrency: string = "RUB",
  initiator: string
): Promise<StorePrice> {
  const redis = getRedisClient();

  const query = main
    .selectFrom("store_cart_items")
    .innerJoin("store_items", "store_items.id", "store_cart_items.product_id")
    .select([
      "store_items.currency",
      "store_items.price"
    ])
    .where("store_cart_items.initiator", "=", initiator)
    .where("store_cart_items.selected", "=", true);

  const [cache, cartItems] = await Promise.all([
    redis.get(EXCHANGE_RATES_KEY),
    query.execute()
  ]);

  if (!cache) throw new Error("Exchange rates cache is not defined");
  if (!cartItems) throw new Error("Cart data is not defined");

  const exchangeRates = JSON.parse(cache) as ExchangeRate[];

  const totals: StorePrice = { REAL: 0, BELKOIN: 0, CHARISM: 0 };

  for (const item of cartItems) {
    const transform = CURRENCIES_TRANSFORMS[item.currency];
    if (!transform) continue;

    const amount = transform(item.price);

    const currency = item.currency

    if (GAME_CURRENCIES.includes(currency as GameCurrency)) {
      totals[currency as GameCurrency] += amount
    } else {
      totals["REAL"] += amount;
    }
  }

  if (currentCurrency !== 'RUB') {
    const rate = exchangeRates.find(
      ({ source, target }) => source === currentCurrency && target === "RUB"
    )?.rate;

    if (rate === undefined) {
      throw new Error(`Exchange rate from RUB to ${currentCurrency} not found`);
    }

    totals.REAL = convertRubToTarget(totals.REAL, Number(rate));
  }

  return totals;
}