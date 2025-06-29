import { LoginForm, RegisterForm, SubmitAuth } from "@/shared/components/app/auth/components/auth";
import { typeAtom } from "@/shared/components/app/auth/models/auth.model";
import { MainWrapperPage } from "@repo/ui/main-wrapper";
import { reatomComponent } from "@reatom/npm-react";
import { motion } from "motion/react"

const Auth = reatomComponent(({ ctx }) => {
  const type = ctx.spy(typeAtom)

  return (
    <motion.div
      className="w-full max-w-md border-2 border-neutral-800 bg-neutral-400 p-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      key={type}
    >
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-primary">
          {type === "login" ? "Войти в аккаунт" : "Создать аккаунт"}
        </h2>
        <p className="text-sm text-base-content/70">
          {type === "login" ? "С возвращением!" : ""}
        </p>
      </motion.div>

      <motion.div
        className="flex flex-col gap-4 w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {type === "register" && <RegisterForm />}
        {type === "login" && <LoginForm />}
        <SubmitAuth />
        <span onClick={() => typeAtom(ctx, (state) => state === 'register' ? 'login' : 'register')}>
          {type === 'register' ? "Login" : "Register"}
        </span>
      </motion.div>
    </motion.div>
  )
})

export default function AuthPage() {
  return (
    <MainWrapperPage>
      <form onSubmit={(e) => e.preventDefault()} className="flex items-center justify-center h-full w-full">
        <Auth/>
      </form>
    </MainWrapperPage>
  )
}