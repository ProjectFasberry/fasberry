import { AuthError, LoginForm, RegisterForm, SubmitAuth } from "@/shared/components/app/auth/components/auth";
import { authIsProcessingAtom, authorizeAction, authSearchParamsAtom, typeAtom } from "@/shared/components/app/auth/models/auth.model";
import { reatomComponent, useUpdate } from "@reatom/npm-react";
import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Typography } from "@repo/ui/typography";
import { action, AtomState } from "@reatom/core";
import { Link } from "@/shared/components/config/link";
import { startPageEvents } from "@/shared/lib/events";
import { pageContextAtom } from "@/shared/models/page-context.model";

const ResetPassword = reatomComponent(({ ctx }) => {
  if (ctx.spy(typeAtom) !== 'login') return null;

  return (
    <Link href="/auth/restore">
      <Typography className='text-center text-lg text-neutral-400'>
        Я забыл пароль
      </Typography>
    </Link>
  )
}, "ResetPassword")

const Auth = reatomComponent(({ ctx }) => {
  const type = ctx.spy(typeAtom)

  const isDisabled = ctx.spy(authIsProcessingAtom)

  return (
    <Tabs
      data-disabled={isDisabled.toString()}
      onValueChange={value => typeAtom(ctx, value as AtomState<typeof typeAtom>)}
      value={type}
      className="flex flex-col gap-4 w-full max-w-lg border rounded-lg border-neutral-800 p-4 sm:p-5 lg:p-6 
        data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-60"
    >
      <TabsList className="flex flex-col sm:flex-row w-full">
        <TabsTrigger className="w-full h-12" value="login">
          <Typography className="text-lg">
            Вход
          </Typography>
        </TabsTrigger>
        <TabsTrigger className="w-full h-12" value="register">
          <Typography className="text-lg">
            Регистрация
          </Typography>
        </TabsTrigger>
      </TabsList>
      <div className="flex flex-col gap-4 w-full h-full">
        <TabsContents>
          <TabsContent value="register">
            <RegisterForm />
          </TabsContent>
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
        </TabsContents>
        <SubmitAuth />
        <ResetPassword />
        <AuthError />
      </div>
    </Tabs>
  )
}, "Auth")

const events = action((ctx) => {
  const pageContext = ctx.get(pageContextAtom);
  if (!pageContext) return;

  const search = pageContext.urlParsed.search
  authSearchParamsAtom(ctx, search)
})

export default function Page() {
  useUpdate((ctx) => startPageEvents(ctx, events), [])

  return (
    <form
      className="flex items-center justify-center h-[80dvh] w-full"
      onSubmit={(e) => e.preventDefault()}
      autoComplete="off"
    >
      <div className="flex items-start justify-center h-[60dvh] w-full">
        <Auth />
      </div>
    </form>
  )
} 