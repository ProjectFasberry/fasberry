import { general } from "#/shared/database/main-db";
import { logError } from "../config/logger";
import { CLOUDFLARE_TURNSTILE_SECRET, isProduction } from "#/shared/env";
import { client } from "#/shared/api/client";

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
    const verifyRes = await client.post("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      json: { secret: CLOUDFLARE_TURNSTILE_SECRET, response: token },
    });

    if (!verifyRes.ok) {
      return "no-verified"
    }

    const result = await verifyRes.json<Payload>();

    if (!result.success) return "no-verified"

    return "verified"
  } catch (e) {
    logError(e)
    return "no-verified"
  }
}

async function validateIpRestricts(ip: string): Promise<boolean> {
  const result = await general
    .selectFrom("AUTH")
    .select(general.fn.countAll().as("count"))
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