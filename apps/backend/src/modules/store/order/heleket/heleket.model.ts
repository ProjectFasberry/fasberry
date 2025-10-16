import { Heleket } from "heleket-api-sdk";

const MERCHANT_KEY = Bun.env.HELEKET_MERCHANT_KEY;
const PAYMENT_KEY = Bun.env.HELEKET_PAYMENT_KEY;
const PAYOUT_KEY = Bun.env.HELEKET_PAYOUT_KEY;

const heleket = new Heleket(MERCHANT_KEY, PAYMENT_KEY, PAYOUT_KEY);

export async function processStoreCryptoPurchaseHeleket() {
  
}
