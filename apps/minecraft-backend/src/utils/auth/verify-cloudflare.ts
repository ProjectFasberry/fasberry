import { logger } from "@repo/lib/logger";
import ky from "ky"

const CLOUDFLARE_TURNSTILE_SECRET_KEY = "0x4AAAAAAA-stfzoKM9_11nOW5V0dd54VS0"

type Payload = {
  success: boolean,
  messages: Array<unknown>,
  challenge_ts: Date,
  action: string,
  cdata: string,
  tokenId: string
}

export async function verifyAuth(token: string) {
  try {
    const verifyRes = await ky.post("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      json: { secret: CLOUDFLARE_TURNSTILE_SECRET_KEY, response: token },
    });

    if (!verifyRes.ok) {
      return "no-verified"
    }

    const result = await verifyRes.json<Payload>();

    if (!result.success) return "no-verified"

    return "verified"
  } catch (e) {
    if (e instanceof Error) {
      logger.error(e.message)
    }

    console.error(e)
    return "no-verified"
  }
}