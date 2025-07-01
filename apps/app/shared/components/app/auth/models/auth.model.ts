import { BASE } from "@/shared/api/client"
import { currentUserAtom, getMe } from "@/shared/api/global.model"
import { withHistory } from "@/shared/lib/reatom-helpers"
import { reatomAsync, withStatusesAtom } from "@reatom/async"
import { action, atom } from "@reatom/core"
import { sleep, withAssign, withReset } from "@reatom/framework"
import { toast } from "sonner"
import { navigate } from "vike/client/router"

type TypeAtom = "register" | "login"
type ErrorType = "nickname" | "password" | "findout"

export const typeAtom = atom<TypeAtom>("login", "type").pipe(withReset(), withHistory())
export const nicknameAtom = atom<string>("", "nicknameAtom").pipe(withReset())
export const passwordAtom = atom<string>("", "passwordAtom").pipe(withReset())
export const findoutAtom = atom<string>("", "findoutAtom").pipe(withReset())
export const referrerAtom = atom<string>("", "referrerAtom").pipe(withReset())
export const tokenAtom = atom<string>("test", "tokenAtom").pipe(withReset())
export const acceptRulesAtom = atom(false, "acceptRules")
export const globalErrorAtom = atom("", "globalError").pipe(withReset())
export const errorTypeAtom = atom<ErrorType[]>([], "errorType").pipe(withReset())

typeAtom.onChange((ctx, target) => {
  const prev = ctx.get(typeAtom.history)[1]

  if (prev !== target) {
    globalErrorAtom.reset(ctx)
    errorTypeAtom.reset(ctx)
  }
})

export const resetErrors = action((ctx) => {
  const current = ctx.get(errorTypeAtom)

  for (const target of current) {
    errorTypeAtom(ctx, state => state.filter(ex => ex !== target))
  }
}, "resetError")

export const isValidAtom = atom<boolean>((ctx) => {
  const type = ctx.spy(typeAtom)
  const nickname = ctx.spy(nicknameAtom)
  const password = ctx.spy(passwordAtom)

  let result = (nickname.length >= 2) && (password.length >= 6)

  if (type === 'register') {
    const findout = ctx.spy(findoutAtom)
    const accept = ctx.spy(acceptRulesAtom)

    return result && !!findout && accept
  }

  return result
})

type ValidationResponse = {
  property: string,
  errors: {
    schema: {
      errorMessage: {
        minLength: string,
        maxLength: string,
        pattern: string
      }
    },
  }[]
}

export const authorize = reatomAsync(async (ctx) => {
    const type = ctx.get(typeAtom)
    const nickname = ctx.get(nicknameAtom)
    const password = ctx.get(passwordAtom)
    const findout = ctx.get(findoutAtom)
    const referrer = ctx.get(referrerAtom)
    const token = ctx.get(tokenAtom)

    if (type === 'register') {
      const accept = ctx.get(acceptRulesAtom)

      if (!accept) {
        toast.error("Вы должны принять правила")
        return;
      }
    }

    return await ctx.schedule(async () => {
      await sleep(200)

      const res = await BASE.post(`auth/${type}`, {
        json: {
          nickname, password, findout, referrer, token
        },
        signal: ctx.controller.signal,
        throwHttpErrors: false
      })

      const data = await res.json<{ data: { id: string, nickname: string } } | { error: string } | ValidationResponse>()

      return data;
    })
  }, {
    name: "authorize",
    onFulfill: async (ctx, res) => {
      if (!res) return

      if ("error" in res) {
        toast.error(res.error)
        globalErrorAtom(ctx, res.error)

        if (res.error.includes("password")) {
          errorTypeAtom(ctx, state => [...state, 'password'])
        }

        if (res.error.includes("nickname")) {
          errorTypeAtom(ctx, state => [...state, 'nickname'])
        }

        return;
      }

      if ("property" in res) {
        const target = res as ValidationResponse

        const property = target.property.slice(1) as ErrorType
        const message = target.errors[0].schema.errorMessage.pattern

        globalErrorAtom(ctx, message)
        errorTypeAtom(ctx, state => [...state, property])

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
    },
    onReject: (ctx, e) => {
      if (e instanceof Error) {
        globalErrorAtom(ctx, e.message)
      }
    }
  }).pipe(
    withStatusesAtom(),
    withAssign(((target) => ({
      isLoading: atom((ctx) => ctx.spy(target.statusesAtom).isPending)
    }))))

export const logout = reatomAsync(async (ctx) => {
  return await ctx.schedule(async () => {
    const res = await BASE.post("auth/invalidate-session", { signal: ctx.controller.signal })

    const data = await res.json<{ status: string } | { error: string }>()

    return data;
  })
}, {
  name: "logout",
  onFulfill: (ctx, res) => {
    if (!res) return;

    if ("error" in res) {
      toast.error(res.error)
      globalErrorAtom(ctx, res.error)
      return;
    }

    currentUserAtom.reset(ctx);

    ctx.schedule(() => window.location.reload())
  }
}).pipe(
  withStatusesAtom(),
  withAssign(((target) => ({
    isLoading: atom((ctx) => ctx.spy(target.statusesAtom).isPending)
  }))))