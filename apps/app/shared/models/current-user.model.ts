import { SKIP_HOOK_HEADER } from './../api/client';
import { atom } from "@reatom/core";
import { withReset } from "@reatom/framework";
import { withSsr } from "../lib/ssr";
import { MePayload } from "@repo/shared/types/entities/user"
import { clientInstance } from "../api/client";
import { parseWrappedJson } from '../lib/client-wrapper';

export const CURRENT_USER_KEY = 'currentUser'

export const currentUserAtom = atom<MePayload | null>(null, "currentUser").pipe(
  withReset(), withSsr(CURRENT_USER_KEY)
);

export const currentUserOptionsAtom = atom((ctx) => ctx.spy(currentUserAtom)?.options ?? null, "currentUserOptions")

export const currentUserPermsAtom = atom((ctx) => ctx.spy(currentUserOptionsAtom)?.permissions ?? [], "currentUserPermsAtom")

export async function getMe(init: RequestInit) {
  const headers = {
    ...init.headers,
    [SKIP_HOOK_HEADER]: "true"
  }

  const res = await clientInstance("me", { 
    ...init, 
    headers, 
    throwHttpErrors: false, 
    retry: 0 
  })

  return parseWrappedJson<MePayload>(res)
}