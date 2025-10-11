import { withHistory } from "@/shared/lib/reatom-helpers"
import { reatomAsync, withStatusesAtom } from "@reatom/async"
import { action, atom, batch, Ctx } from "@reatom/core"
import { withAssign, withReset } from "@reatom/framework"
import { toast } from "sonner"
import { logError } from "@/shared/lib/log"
import { client, withJsonBody } from "@/shared/lib/client-wrapper"
import z, { ZodError } from "zod"
import { registerSchema, authSchema as loginSchema } from "@repo/shared/types/entities/auth"

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
  batch(ctx, () => {
    nicknameAtom.reset(ctx)
    passwordAtom.reset(ctx)
    findoutAtom.reset(ctx)
    referrerAtom.reset(ctx)
    tokenAtom.reset(ctx)
    acceptRulesAtom.reset(ctx)
    globalErrorAtom.reset(ctx)
    errorTypeAtom.reset(ctx)
  })
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

function registerCb(ctx: Ctx) {
  resetAuth(ctx)
  toast.success("Всё ок! Теперь войдите в аккаунт")
  typeAtom(ctx, "login")
}

function loginCb(ctx: Ctx) {
  ctx.schedule(() => window.location.reload())
}

const target = {
  "register": {
    schema: registerSchema,
    event: registerCb
  },
  "login": {
    schema: loginSchema,
    event: loginCb
  }
}

export const authorize = reatomAsync(async (ctx) => {
  const type = ctx.get(typeAtom)

  const raw = {
    nickname: ctx.get(nicknameAtom),
    password: ctx.get(passwordAtom),
    findout: ctx.get(findoutAtom),
    referrer: ctx.get(referrerAtom),
    token: ctx.get(tokenAtom)
  }

  if (type === 'register') {
    const accept = ctx.get(acceptRulesAtom);

    if (!accept) {
      toast.error("Вы должны принять правила");
      return;
    };
  }

  const { success, error, data } = z.safeParse(target[type].schema, raw)
  if (!success) return error;

  return await ctx.schedule(() =>
    client
      .post(`auth/${type}`, { throwHttpErrors: false })
      .pipe(withJsonBody(data))
      .exec()
  )
}, {
  name: "authorize",
  onFulfill: async (ctx, res) => {
    if (!res) return;

    if (res instanceof ZodError) {
      const issue = res.issues.map(d => d)[0];
      console.log(issue);

      const property = issue.path[0].toString() as ErrorType;

      batch(ctx, () => {
        globalErrorAtom(ctx, issue.message)
        errorTypeAtom(ctx, state => [...state, property])
      })

      return;
    }

    const type = ctx.get(typeAtom);
    target[type].event(ctx);
  },
  onReject: (ctx, e) => {
    logError(e);

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
  withAssign((
    (target) => ({
      isLoading: atom((ctx) => ctx.spy(target.statusesAtom).isPending)
    }))
  )
)

export const logout = reatomAsync(async (ctx) => {
  return await ctx.schedule(() =>
    client.post("auth/invalidate-session").exec()
  )
}, {
  name: "logout",
  onFulfill: (ctx, res) => {
    if (!res) return;

    ctx.schedule(() => window.location.reload())
  },
  onReject: (ctx, e) => {
    logError(e, { type: "toast" });

    if (e instanceof Error) {
      globalErrorAtom(ctx, e.message)
    }
  }
}).pipe(
  withStatusesAtom(),
  withAssign((
    (target) => ({
      isLoading: atom((ctx) => ctx.spy(target.statusesAtom).isPending)
    }))
  )
)