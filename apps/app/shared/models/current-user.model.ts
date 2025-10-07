import { atom } from "@reatom/core";
import { withReset } from "@reatom/framework";
import { client } from "../api/client";
import { withSsr } from "../lib/ssr";
import { MePayload } from "@repo/shared/types/entities/user"

export const currentUserAtom = atom<MePayload | null>(null, "currentUser").pipe(
  withReset(), withSsr("currentUser")
);

export const currentUserOptionsAtom = atom((ctx) => ctx.spy(currentUserAtom)?.options ?? null, "currentUserOptions")

export const currentUserPermsAtom = atom((ctx) => ctx.spy(currentUserOptionsAtom)?.permissions ?? [], "currentUserPermsAtom")

export async function getMe(args?: RequestInit) {
  const res = await client("me", { throwHttpErrors: false, retry: 0, ...args })
  if (!res.ok) return null;

  const data = await res.json<WrappedResponse<MePayload>>()

  if ('error' in data) return null;

  return data.data;
}