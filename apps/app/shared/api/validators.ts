import { BASE } from "./client";

export async function validateSession(headers?: Record<string, string>) {
  const res = await BASE(`auth/validate-session`, { headers, throwHttpErrors: false })
  const data = await res.json<WrappedResponse<string>>()

  if ("error" in data) return false;

  return data.data;
}

export async function validatePrivate(headers?: Record<string, string>): Promise<boolean> {
  const res = await BASE("private/validate", { headers, throwHttpErrors: false })
  const data = await res.json<WrappedResponse<boolean>>()
  
  console.log(data)

  if ("error" in data) return false;

  return data.data;
}