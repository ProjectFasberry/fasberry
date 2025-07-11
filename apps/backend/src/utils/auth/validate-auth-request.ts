import { isProduction } from "#/helpers/is-production"
import { auth } from "#/shared/database/auth-db";
import { logger } from "@repo/lib/logger";
import ky from "ky"

type Payload = {
  success: boolean,
  messages: Array<unknown>,
  challenge_ts: Date,
  action: string,
  cdata: string,
  tokenId: string
}

const MAX_USERS_PER_IP = 3;

export async function verifyAuth(token: string) {
  try {
    const verifyRes = await ky.post("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      json: { secret: Bun.env.CLOUDFLARE_TURNSTILE_SECRET_KEY, response: token },
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

    return "no-verified"
  }
}

async function validateIpRestricts(ip: string): Promise<boolean> {
  const result = await auth
    .selectFrom("AUTH")
    .select(auth.fn.countAll().as("count"))
    .where("IP", "=", ip)
    .$castTo<{ count: number }>()
    .executeTakeFirst();

  if (!result) return false;

  return result.count > MAX_USERS_PER_IP;
}

export const validateAuthenticationRequest = async ({ ip, token }: { ip: string, token?: string | null }) => {
  if (!isProduction) return;

  if (isProduction && !token) {
    return { error: "Token is not provided" }
  }

  const isVerified = await verifyAuth(token!)

  if (isVerified === "no-verified") {
    return { error: "Invalid token" }
  }

  if (!ip) {
    return { error: "IP is not provided" }
  }

  const isValid = await validateIpRestricts(ip)

  if (isValid) {
    return { error: "IP already exists" }
  }
}