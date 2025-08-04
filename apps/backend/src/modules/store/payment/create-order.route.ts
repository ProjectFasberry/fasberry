import Elysia from "elysia";
import z from "zod/v4";
import { createCryptoOrder, rollbackOrder } from "./create-crypto-order";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { throwError } from "#/helpers/throw-error";
import { currencyCryptoSchema, currencyFiatSchema } from "@repo/shared/schemas/entities/currencies-schema";
import { createOrderSchema, paymentCurrencySchema } from "@repo/shared/schemas/payment";
import { GAME_CURRENCIES, GameCurrency } from "../store-items.route";
import { main } from "#/shared/database/main-db";
import { logger } from "#/utils/config/logger";
import { callServerCommand } from "#/utils/server/call-command";
import { processDonatePayment } from "#/utils/payment/process-donate-payment";
import { executeSaga, TransactionalTask } from "#/utils/config/saga";
import type { CreateOrderRoutePayload } from "@repo/shared/types/entities/payment"
import { userDerive } from "#/lib/middlewares/user";
import { isProduction } from "#/helpers/is-production";

function getParamFromUrl(url: string, param: string): string | null {
  const parsedUrl = new URL(url);
  return parsedUrl.searchParams.get(param);
}

type TaskItem = {
  type: string,
  value: string
  recipient: string,
}

function createTasksForItem({ recipient, type, value }: TaskItem): TransactionalTask[] {
  const tasks: TransactionalTask[] = [];

  if (type === 'donate') {
    tasks.push(...processDonatePayment({ recipient, type: "donate", value }));
  }

  if (type === 'event') {
    tasks.push({
      name: "notify-player",
      execute: (signal) => callServerCommand(
        { parent: "cmi", value: `toast ${recipient} Поздравляем с покупкой!` }, { signal }
      )
    })
  }

  return tasks;
}

type Item = {
  id: number;
  title: string;
  price: string;
  type: string;
  value: string;
}

type GameItems = Item & { currency: GameCurrency }
type RealItems = Item & { currency: string }

type ProcessStoreGamePurchase = {
  items: GameItems[],
  itemsMap: Map<number, string>
}

type ProcessStoreGamePurchasePayload = {
  data: {
    isSuccess: boolean;
    totalPrice: Record<"CHARISM" | "BELKOIN", number>;
  } | null,
  error: string | null
}

const initialPrices = Object.fromEntries(
  GAME_CURRENCIES.map(currency => [currency, 0])
) as Record<GameCurrency, number>;

async function processStoreGamePurchase({
  items, itemsMap
}: ProcessStoreGamePurchase): Promise<ProcessStoreGamePurchasePayload> {
  if (!items.length) return { data: null, error: null }

  const finishPrice = items.reduce((acc, item) => {
    const { currency, price } = item;

    if (currency in acc) {
      acc[currency] += parseFloat(price);
    } else {
      acc[currency] = parseFloat(price);
    }

    return acc;
  }, initialPrices);

  async function execute() {
    const globalTasks: TransactionalTask[] = []

    if (finishPrice.BELKOIN > 0) {
      const takeBelkoinTask: TransactionalTask = {
        name: "take-belkoin",
        execute: (signal) => callServerCommand(
          { parent: "p", value: `take ${finishPrice.BELKOIN}` },
          { signal }
        ),
        rollback: (signal) => callServerCommand(
          { parent: "p", value: `give ${finishPrice.BELKOIN}` },
          { signal }
        )
      };

      globalTasks.push(takeBelkoinTask);
    }

    if (finishPrice.CHARISM > 0) {
      const takeCharismTask: TransactionalTask = {
        name: "take-charism",
        execute: (signal) => callServerCommand(
          { parent: "p", value: `take ${finishPrice.CHARISM}` },
          { signal }
        ),
        rollback: (signal) => callServerCommand(
          { parent: "p", value: `give ${finishPrice.CHARISM}` },
          { signal }
        )
      };

      globalTasks.push(takeCharismTask);
    }

    const products = items.map(target => ({
      ...target,
      recipient: itemsMap.get(target.id)!
    }));

    products.forEach(product => {
      const productTasks = createTasksForItem(product);
      globalTasks.push(...productTasks);
    });

    const results = await executeSaga(globalTasks)

    console.log(results)

    return results;
  }

  try {
    const result = await execute()

    if (result.status === 'error') {
      console.error("Game currency purchase failed and was rolled back.", result.error);

      return {
        data: null,
        error: `${result.error instanceof Error ? result.error.message : 'Unknown error'}`
      };
    }

    const data = { isSuccess: result.results.length >= 1, totalPrice: finishPrice }

    return { data, error: null }
  } catch (e) {
    if (e instanceof Error) {
      return { data: null, error: e.message }
    }
  }

  return { data: null, error: null }
}

type ProcessStoreFiatOrCryptoPurchase = {
  items: RealItems[],
  itemsMap: Map<number, string>,
  currency: z.infer<typeof paymentCurrencySchema>,
  details: {
    initiator: string
  }
}

type ProcessStoreFiatOrCryptoPurchasePayload = {
  data: {
    url: string,
    orderId: string,
    invoiceId: number,
    totalPrice: number;
    uniqueId: string;
  } | null,
  error: string | null
}

async function processStoreFiatOrCryptoPurchase({
  items, itemsMap, currency, details: { initiator }
}: ProcessStoreFiatOrCryptoPurchase): Promise<ProcessStoreFiatOrCryptoPurchasePayload> {
  if (!items.length) return { data: null, error: null }

  const { success: isCrypto, data: cryptoCurrency } = currencyCryptoSchema.safeParse(currency);
  const { success: isFiat, data: fiatCurrency } = currencyFiatSchema.safeParse(currency);

  let totalPrice = 0;

  for (const product of items) {
    const price = Number(product.price) / 100
    totalPrice += price
  }

  if (isCrypto) {
    const products = items.map(target => ({
      ...target,
      recipient: itemsMap.get(target.id)!
    }));

    const payment = await createCryptoOrder({
      products,
      details: {
        totalPrice,
        type: "store",
        asset: cryptoCurrency,
        initiator
      }
    });

    const data = {
      invoiceId: payment.result.invoice_id,
      orderId: payment.result.hash,
      url: payment.result.pay_url,
      uniqueId: payment.result.uniqueId,
      totalPrice
    };

    return { data, error: null }
  }

  if (isFiat && fiatCurrency) {
    // todo: impl fiat processing
    return { data: null, error: "Платежи в фиатной валюте временно недоступны" }
  }

  throw new Error("Некорректная валюта")
}

const ERRORS_MAP: Record<string, string> = {
  "TIMEOUT": "Похоже игровой сервер не доступен"
}

function isGameCurrency(value: string): value is GameCurrency {
  return GAME_CURRENCIES.includes(value as GameCurrency);
}

export const CLIENT_ID_HEADER_KEY = "client_id"

export const createOrderRoute = new Elysia()
  .use(userDerive())
  .post('/create-order', async (ctx) => {
    const { data, success } = createOrderSchema.safeParse(ctx.body);

    if (!success) {
      return ctx.status(HttpStatusEnum.HTTP_400_BAD_REQUEST, throwError("Invalid body"))
    }

    const initiator: string | null = ctx.nickname ?? (ctx.cookie[CLIENT_ID_HEADER_KEY].value ?? null);

    if (!initiator) {
      throw new Error("Initiator is not defined")
    }

    !isProduction && logger.debug(`Initiator ${initiator}`)

    const { currency } = data;

    try {
      const query = await main
        .selectFrom("store_cart_items")
        .innerJoin("store_items", "store_items.id", "store_cart_items.product_id")
        .select([
          "store_items.id",
          "store_items.currency",
          "store_items.title",
          "store_items.price",
          "store_items.type",
          "store_items.value",
          "store_cart_items.for as recipient"
        ])
        .where("store_cart_items.initiator", "=", initiator)
        .where("store_cart_items.selected", "=", true)
        .execute()

      if (query.length === 0) {
        throw new Error("Товары не найдены или устарели")
      }

      const items = query.filter(
        (target): target is typeof target & { recipient: string } =>
          typeof target.recipient === 'string'
      );

      const gameItems = items.filter(
        (target): target is typeof target & { currency: GameCurrency } => isGameCurrency(target.currency)
      );

      const realItems = query.filter((target) => !isGameCurrency(target.currency));

      const itemsMap = new Map(
        items.map(item => [item.id, item.recipient])
      );

      const [realResult, gameResult] = await Promise.all([
        processStoreFiatOrCryptoPurchase({ items: realItems, itemsMap, currency, details: { initiator } }),
        processStoreGamePurchase({ items: gameItems, itemsMap })
      ])

      if (realResult.error) {
        return ctx.status(HttpStatusEnum.HTTP_400_BAD_REQUEST, throwError(realResult.error));
      }

      if (gameResult.error) {
        if (realResult.data) {
          const { uniqueId, invoiceId } = realResult.data

          await rollbackOrder({
            uniqueId: uniqueId, invoiceId, initiator
          })
        }

        const error = ERRORS_MAP[gameResult.error] ?? gameResult.error

        return ctx.status(HttpStatusEnum.HTTP_400_BAD_REQUEST, throwError(error));
      }

      const data: CreateOrderRoutePayload = {
        realPurchase: realResult.data
          ? {
            url:
              realResult.data.url,
            invoiceId: realResult.data.invoiceId,
            uniqueId: realResult.data.uniqueId
          }
          : null,
        gamePurchase: gameResult.data ? { isSuccess: gameResult.data.isSuccess } : null,
        payload: {
          price: {
            BELKOIN: gameResult.data?.totalPrice.BELKOIN ?? 0,
            CHARISM: gameResult.data?.totalPrice.CHARISM ?? 0,
            global: realResult.data?.totalPrice ?? 0
          }
        }
      };

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  }, {
    parse: "json"
  });