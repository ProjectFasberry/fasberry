import { atom } from "@reatom/core";
import { withReset } from "@reatom/framework";
import { withSsr } from "../lib/ssr";
import { MePayload } from "@repo/shared/types/entities/user"
import { client, withAbort } from "../lib/client-wrapper";

export const currentUserAtom = atom<MePayload | null>(null, "currentUser").pipe(
  withReset(), withSsr("currentUser")
);

export const currentUserOptionsAtom = atom((ctx) => ctx.spy(currentUserAtom)?.options ?? null, "currentUserOptions")

export const currentUserPermsAtom = atom((ctx) => ctx.spy(currentUserOptionsAtom)?.permissions ?? [], "currentUserPermsAtom")

export async function getMe(init: RequestInit) {
  return client<MePayload>("me", { ...init, throwHttpErrors: false, retry: 0 })
    .pipe(withAbort(init.signal))
    .exec()
}