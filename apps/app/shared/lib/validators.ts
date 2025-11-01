import { PageContextServer } from "vike/types";
import { client } from "./client-wrapper";
import { APP_OPTIONS_KEY, AppOptionsPayloadExtend } from "../models/app.model";

export async function validateSession(init: RequestInit) {
  return client<string>(`auth/validate-session`, { ...init, throwHttpErrors: false }).exec()
}

export function getIsAuth(snapshot: PageContextServer["snapshot"]) {
  const actualSnapshot = snapshot[APP_OPTIONS_KEY].data as AppOptionsPayloadExtend;
  const isAuth = actualSnapshot.isAuth
  return isAuth
}