import { client } from "./client-wrapper";

export async function validateSession(init: RequestInit) {
  return client<string>(`auth/validate-session`, { ...init, throwHttpErrors: false }).exec()
}