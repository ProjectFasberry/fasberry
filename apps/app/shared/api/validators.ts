import { BASE } from "./client";
import { PageContext } from "vike/types";
import { redirect } from "vike/abort";

async function request(headers?: Record<string, string>) {
  const res = await BASE(`auth/validate-session`, { headers: headers })

  if (!res.ok) return false;

  const data = await res.json<WrappedResponse<string>>()

  if ("error" in data) return false;

  return data.data;
}

export async function validateRequest(ctx: PageContext) {
  const isValid = await request(ctx.headers ?? undefined)

  if (ctx.urlPathname === '/auth') {
    if (isValid) {
      throw redirect("/")
    }
  } else {
    if (!isValid) {
      throw redirect("/")
    }
  }
}