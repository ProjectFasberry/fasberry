import { atom } from "@reatom/core";
import { withReset } from "@reatom/framework";
import { client } from "../api/client";
import { withSsr } from "../lib/ssr";

export const currentUserAtom = atom<CurrentUser | null>(null, "currentUser").pipe(
  withReset(), withSsr("currentUser")
);

export async function getMe(args?: RequestInit) {
  const res = await client("me", { throwHttpErrors: false, retry: 0, ...args })

  if (!res.ok) return null;

  const data = await res.json<WrappedResponse<CurrentUser>>()

  if ('error' in data) return null;

  return data.data;
}