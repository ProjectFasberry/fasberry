import { BASE } from "@/shared/api/client"
import { currentUserAtom, getMe } from "@/shared/api/global.model"
import { reatomAsync, withStatusesAtom } from "@reatom/async"
import { atom } from "@reatom/core"
import { withAssign, withReset } from "@reatom/framework"
import { toast } from "sonner"
import { navigate } from "vike/client/router"

type TypeAtom = "register" | "login"

type Payload = {
  nickname: string,
  password: string
  findout: string,
  token: string,
  referrer?: string
}

async function request(type: TypeAtom, payload: Payload, signal: AbortSignal) {
  const res = await BASE.post(type, {
    json: payload, signal
  })

  const data = await res.json<{ data: { id: string, nickname: string } } | { error: string }>()

  return data;
}

export const typeAtom = atom<TypeAtom>("register", "type").pipe(withReset())
export const nicknameAtom = atom<string>("", "nicknameAtom").pipe(withReset())
export const passwordAtom = atom<string>("", "passwordAtom").pipe(withReset())
export const findoutAtom = atom<string>("", "findoutAtom").pipe(withReset())
export const referrerAtom = atom<string>("", "referrerAtom").pipe(withReset())
export const tokenAtom = atom<string>("test", "tokenAtom").pipe(withReset())

export const authorize = reatomAsync(async (ctx) => {
  const type = ctx.get(typeAtom)
  const nickname = ctx.get(nicknameAtom)
  const password = ctx.get(passwordAtom)
  const findout = ctx.get(findoutAtom)
  const referrer = ctx.get(referrerAtom)
  const token = ctx.get(tokenAtom)

  return await ctx.schedule(() => request(type, { nickname, token, password, findout, referrer }, ctx.controller.signal))
}, {
  name: "authorize",
  onFulfill: async (ctx, res) => {
    if (!res) return

    if ("error" in res) {
      toast.error(res.error)
      return;
    }

    const type = ctx.get(typeAtom)

    if (res.data) {
      if (type === 'register') {
        findoutAtom.reset(ctx)
        referrerAtom.reset(ctx)
      }

      passwordAtom.reset(ctx)
      nicknameAtom.reset(ctx)

      ctx.schedule(() => navigate(`/player/${res.data.nickname}`))

      const user = await ctx.schedule(() => getMe())
      currentUserAtom(ctx, user)
    }
  }
}).pipe(withStatusesAtom())

async function logoutRequest(signal: AbortSignal) {
  const res = await BASE.post("invalidate-session", { signal })
  const data = await res.json<{ status: string } | { error: string }>()
  return data;
}

export const logout = reatomAsync(async (ctx) => {
  return await ctx.schedule(() => logoutRequest(ctx.controller.signal))
}, {
  name: "logout",
  onFulfill: (ctx, res) => {
    if (!res) return;

    if ("error" in res) {
      toast.error(res.error)
      return;
    }

    currentUserAtom.reset(ctx);

    ctx.schedule(() => window.location.reload())
  }
}).pipe(
  withStatusesAtom(),
  withAssign(((target) => ({
    isLoading: atom((ctx) => ctx.spy(target.statusesAtom).isPending)
  }))
))