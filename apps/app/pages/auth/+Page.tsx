import { AuthError, LoginForm, RegisterForm, SubmitAuth } from "@/shared/components/app/auth/components/auth";
import { typeAtom } from "@/shared/components/app/auth/models/auth.model";
import { reatomComponent } from "@reatom/npm-react";
import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Typography } from "@repo/ui/typography";
import { AtomState } from "@reatom/core";
import { MainWrapperPage } from "@/shared/components/config/wrapper";

const Auth = reatomComponent(({ ctx }) => {
  const type = ctx.spy(typeAtom)

  return (
    <Tabs
      onValueChange={value => typeAtom(ctx, value as AtomState<typeof typeAtom>)}
      value={type}
      className="flex flex-col gap-4 w-full max-w-lg border rounded-lg border-neutral-800 p-4 sm:p-5 lg:p-6"
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
        <AuthError />
      </div>
    </Tabs>
  )
}, "Auth")

export default function Page() {
  return (
    <MainWrapperPage>
      <form
        className="flex items-center justify-center h-[80dvh] w-full"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="flex items-start justify-center h-[60dvh] w-full">
          <Auth />
        </div>
      </form>
    </MainWrapperPage>
  )
}