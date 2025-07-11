import { BASE } from "./client";

export async function validateSession(args?: RequestInit) {
  const res = await BASE(`auth/validate-session`, { throwHttpErrors: false, ...args })
  const data = await res.json<WrappedResponse<string>>()

  if ("error" in data) return false;

  return data.data;
}

export async function validatePrivate(args?: RequestInit): Promise<boolean> {
  const res = await BASE("private/validate", { throwHttpErrors: false, ...args })
  const data = await res.json<WrappedResponse<boolean>>()
  
  if ("error" in data) return false;

  return data.data;
}