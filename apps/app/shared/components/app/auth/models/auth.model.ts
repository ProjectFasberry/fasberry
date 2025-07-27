import { client } from "@/shared/api/client"
import { currentUserAtom } from "@/shared/models/current-user.model"
import { withHistory } from "@/shared/lib/reatom-helpers"
import { reatomAsync, withStatusesAtom } from "@reatom/async"
import { action, atom, Ctx } from "@reatom/core"
import { sleep, withAssign, withReset } from "@reatom/framework"
import { toast } from "sonner"

type TypeAtom = "register" | "login"
type ErrorType = "nickname" | "password" | "findout"

export const typeAtom = atom<TypeAtom>("login", "type").pipe(withHistory())
export const nicknameAtom = atom<string>("", "nicknameAtom").pipe(withReset())
export const passwordAtom = atom<string>("", "passwordAtom").pipe(withReset())
export const findoutAtom = atom<string>("", "findoutAtom").pipe(withReset())
export const referrerAtom = atom<string>("", "referrerAtom").pipe(withReset())
export const tokenAtom = atom<string>("test", "tokenAtom").pipe(withReset())
export const acceptRulesAtom = atom(false, "acceptRules").pipe(withReset())
export const globalErrorAtom = atom("", "globalError").pipe(withReset())
export const errorTypeAtom = atom<ErrorType[]>([], "errorType").pipe(withReset())

function resetAuth(ctx: Ctx) {
  nicknameAtom.reset(ctx)
  passwordAtom.reset(ctx)
  findoutAtom.reset(ctx)
  referrerAtom.reset(ctx)
  tokenAtom.reset(ctx)
  acceptRulesAtom.reset(ctx)
  globalErrorAtom.reset(ctx)
  errorTypeAtom.reset(ctx)
}

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

    const res = await client.post(`auth/${type}`, {
      throwHttpErrors: false,
      signal: ctx.controller.signal,
      json: {
        nickname, password, findout, referrer, token
      },
    })

    const data = await res.json<WrappedResponse<{ id: string, nickname: string }> | ValidationResponse>()

    if ("error" in data) {
      throw new Error(data.error)
    }

    return data;
  })
}, {
  name: "authorize",
  onFulfill: async (ctx, res) => {
    if (!res) return

    if ("property" in res) {
      const target = res as ValidationResponse

      const property = target.property.slice(1) as ErrorType
      const message = target.errors[0].schema.errorMessage.pattern

      globalErrorAtom(ctx, message)
      errorTypeAtom(ctx, state => [...state, property])

      return;
    }

    if (res.data) {
      const type = ctx.get(typeAtom)

      if (type === 'register') {
        resetAuth(ctx)
        toast.success("Всё ок! Теперь войдите в аккаунт")
        typeAtom(ctx, "login")
      }

      if (type === 'login') {
        ctx.schedule(() => window.location.reload())
      }
    }
  },
  onReject: (ctx, e) => {
    if (e instanceof Error) {
      globalErrorAtom(ctx, e.message)

      if (e.message.includes("password")) {
        errorTypeAtom(ctx, state => [...state, 'password'])
      }

      if (e.message.includes("nickname")) {
        errorTypeAtom(ctx, state => [...state, 'nickname'])
      }
    }
  }
}).pipe(
  withStatusesAtom(),
  withAssign(((target) => ({
    isLoading: atom((ctx) => ctx.spy(target.statusesAtom).isPending)
  }))))

export const logout = reatomAsync(async (ctx) => {
  return await ctx.schedule(async () => {
    const res = await client.post("auth/invalidate-session", { signal: ctx.controller.signal })
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
  },
  onReject: (_, e) => e instanceof Error && toast.error(e.message)
}).pipe(
  withStatusesAtom(),
  withAssign(((target) => ({
    isLoading: atom((ctx) => ctx.spy(target.statusesAtom).isPending)
  }))))