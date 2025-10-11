import { client } from "./client-wrapper";

export async function validateSession(init: RequestInit) {
  return client<string>(`auth/validate-session`, { ...init, throwHttpErrors: false }).exec()
}

export async function validatePrivate(init: RequestInit): Promise<boolean> {
  return client<boolean>("privated/validate", { ...init, throwHttpErrors: false }).exec()
}