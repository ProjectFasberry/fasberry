import { client } from "../api/client";

export async function validateSession(args?: RequestInit) {
  const res = await client(`auth/validate-session`, { throwHttpErrors: false, ...args })
  const data = await res.json<WrappedResponse<string>>()

  if ("error" in data) return false;

  return data.data;
}

export async function validatePrivate(args?: RequestInit): Promise<boolean> {
  const res = await client("private/validate", { throwHttpErrors: false, ...args })
  const data = await res.json<WrappedResponse<boolean>>()
  
  if ("error" in data) return false;

  return data.data;
}