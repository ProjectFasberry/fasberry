import { client } from "../api/client";

export async function validateSession(init?: RequestInit) {
  const res = await client(`auth/validate-session`, { throwHttpErrors: false, ...init })
  const data = await res.json<WrappedResponse<string>>()

  if ("error" in data) return false;

  return data.data;
}

export async function validatePrivate(init?: RequestInit): Promise<boolean> {
  const res = await client("privated/validate", { throwHttpErrors: false, ...init })
  const data = await res.json<WrappedResponse<boolean>>()
  
  if ("error" in data) return false;

  return data.data;
}