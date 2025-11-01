import { withHistory } from "@/shared/lib/reatom-helpers"
import { reatomAsync, withStatusesAtom } from "@reatom/async"
import { action, atom, batch } from "@reatom/core"
import { reatomRecord, withAssign, withReset } from "@reatom/framework"
import { toast } from "sonner"
import { logError } from "@/shared/lib/log"
import { client, withJsonBody } from "@/shared/lib/client-wrapper"
import z, { ZodError } from "zod"
import { registerSchema, authSchema as loginSchema } from "@repo/shared/types/entities/auth"
import { withSearchParamsPersist } from '@reatom/url'

type TypeAtom = "register" | "login"
type ErrorType = "nickname" | "password" | "findout"
type FindoutType = "referrer" | "custom"

const DEFAULT_TYPE: TypeAtom = "login";

export const typeAtom = atom<TypeAtom>(DEFAULT_TYPE, "type").pipe(
  withHistory(),
  withSearchParamsPersist('type', (type = 'login') => type)
)

export const nicknameAtom = atom<string>("", "nicknameAtom").pipe(withReset())
export const passwordAtom = atom<string>("", "passwordAtom").pipe(withReset())
export const passwordShowAtom = atom(false, "passwordShow")
export const findoutTypeAtom = atom<FindoutType | null>(null, "findoutType").pipe(withReset())

// Must be refererr nickname or other findout info
export const findoutAtom = atom<string | undefined>(undefined, "findoutAtom").pipe(
  withReset(),
)

export const tokenAtom = atom<string>("test", "tokenAtom").pipe(withReset());
export const acceptRulesAtom = atom(false, "acceptRules").pipe(withReset());

export const authSearchParamsAtom = reatomRecord<Record<string, string>>({}, "authSearchParams")

export const globalErrorAtom = atom<Nullable<string>>(null, "globalError").pipe(withReset())
export const errorsTypeAtom = atom<ErrorType[]>([], "errorsType").pipe(withReset())

export const authIsProcessingAtom = atom(false, "authIsProcessing")

export const FINDOUT_OPTIONS: { title: string, value: FindoutType }[] = [
  { title: "От другого игрока", value: "referrer" },
  { title: "Другое", value: "custom" }
]

export const findoutSelectedTypeAtom = atom(
  (ctx) => FINDOUT_OPTIONS.find(d => d.value === ctx.spy(findoutTypeAtom)) ?? null,
  "findoutSelected"
)

authSearchParamsAtom.onChange((ctx, state) => {
  const isReferrer = "referrer" in state;

  if (isReferrer) {
    findoutAtom(ctx, state.referrer)
    findoutTypeAtom(ctx, "referrer")
  }
})

typeAtom.onChange((ctx) => auth.resetErrors(ctx))

export const authIsValidAtom = atom<boolean>((ctx) => {
  const type = ctx.spy(typeAtom)
  const nickname = ctx.spy(nicknameAtom)
  const password = ctx.spy(passwordAtom)

  const baseValid = nickname.length >= 2 && password.length >= 6
  if (type !== 'register') return baseValid

  return baseValid && !!ctx.spy(findoutAtom) && !!ctx.spy(acceptRulesAtom)
}, "authIsValid")

export const auth = atom(null, "auth").pipe(
  withAssign((ctx, name) => ({
    register: action((ctx) => {
      ctx.schedule(() => auth.resetFull(ctx))
      typeAtom(ctx, "login")
      toast.success("Всё ок! Теперь войдите в аккаунт")
    }, `${name}.register`),
    login: action((ctx) => {
      ctx.schedule(() => window.location.reload())
    }, `${name}.login`),
    logout: action((ctx) => {
      ctx.schedule(() => window.location.reload())
    }, `${name}.logout`),
    resetFull: action((ctx) => {
      batch(ctx, () => {
        nicknameAtom.reset(ctx)
        passwordAtom.reset(ctx)
        findoutAtom.reset(ctx)
        tokenAtom.reset(ctx)
        acceptRulesAtom.reset(ctx)
        globalErrorAtom.reset(ctx)
        errorsTypeAtom.reset(ctx)
        findoutTypeAtom.reset(ctx)
      })
    }, `${name}.resetFull`),
    resetErrors: action((ctx) => {
      globalErrorAtom.reset(ctx)
      errorsTypeAtom.reset(ctx)
    }, `${name}.resetErrors`),
    resetError: action((ctx) => {
      const errors = ctx.get(errorsTypeAtom)

      for (const target of errors) {
        errorsTypeAtom(ctx, state => state.filter(error => error !== target))
      }
    }, `${name}.resetError`)
  }))
)

const authTargets = {
  "register": {
    schema: registerSchema,
    event: auth.register
  },
  "login": {
    schema: loginSchema,
    event: auth.login
  }
}

export const authorizeAction = reatomAsync(async (ctx) => {
  const type = ctx.get(typeAtom)

  const raw = {
    nickname: ctx.get(nicknameAtom),
    password: ctx.get(passwordAtom),
    findout: ctx.get(findoutAtom),
    findoutType: ctx.get(findoutTypeAtom),
    token: ctx.get(tokenAtom)
  }

  if (type === 'register') {
    const accept = ctx.get(acceptRulesAtom);

    if (!accept) {
      toast.error("Вы должны принять правила");
      return;
    };
  }

  authIsProcessingAtom(ctx, true)

  const { success, error, data } = z.safeParse(authTargets[type].schema, raw)
  if (!success) return error;

  return await ctx.schedule(() =>
    client
      .post(`auth/${type}`, { throwHttpErrors: false, timeout: 10000 })
      .pipe(withJsonBody(data))
      .exec()
  )
}, {
  name: "authorize",
  onFulfill: async (ctx, res) => {
    if (!res) return;

    if (res instanceof ZodError) {
      const issue = res.issues.map(d => d)[0];
      const property = issue.path[0].toString() as ErrorType;

      batch(ctx, () => {
        globalErrorAtom(ctx, issue.message)
        errorsTypeAtom(ctx, state => [...state, property])
      })

      authIsProcessingAtom(ctx, false);

      return;
    }

    const type = ctx.get(typeAtom);

    if (type === 'register') {
      authIsProcessingAtom(ctx, false)
    }

    authTargets[type].event(ctx);
  },
  onReject: (ctx, e) => {
    logError(e);
    authIsProcessingAtom(ctx, false);

    if (e instanceof Error) {
      globalErrorAtom(ctx, e.message)

      if (e.message.includes("password")) {
        errorsTypeAtom(ctx, state => [...state, 'password'])
      }

      if (e.message.includes("nickname")) {
        errorsTypeAtom(ctx, state => [...state, 'nickname'])
      }
    }
  }
}).pipe(withStatusesAtom())

export const logoutAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(() =>
    client.post("auth/invalidate-session").exec()
  )
}, {
  name: "logoutAction",
  onFulfill: (ctx) => auth.logout(ctx),
  onReject: (ctx, e) => {
    logError(e);

    if (e instanceof Error) {
      globalErrorAtom(ctx, e.message)
    }
  }
}).pipe(withStatusesAtom())