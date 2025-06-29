import { isProduction } from "#/helpers/is-production"
import { auth } from "#/shared/auth-db";
import { verifyAuth } from "./verify-cloudflare";

export const MAX_USERS_PER_IP = 3;

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
  if (!isProduction()) {
    return;
  }

  if (isProduction() && !token) {
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