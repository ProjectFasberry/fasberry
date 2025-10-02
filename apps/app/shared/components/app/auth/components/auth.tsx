import { reatomComponent } from "@reatom/npm-react";
import {
  acceptRulesAtom,
  authorize,
  globalErrorAtom,
  errorTypeAtom,
  findoutAtom,
  isValidAtom,
  nicknameAtom,
  passwordAtom,
  typeAtom,
  resetErrors
} from "../models/auth.model";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input"
import { tv } from "tailwind-variants";
import { Typography } from "@repo/ui/typography";
import { toast } from "sonner";

const authInput = tv({
  base: `p-2 text-lg bg-transparent border rounded-md data-[state=error]:border-red-500 data-[state=default]:border-neutral-600`
})

const Nickname = reatomComponent(({ ctx }) => {
  const state = ctx.spy(errorTypeAtom).includes("nickname") ? "error" : "default"

  return (
    <Input
      className={authInput()}
      data-state={state}
      value={ctx.spy(nicknameAtom)}
      onClick={() => resetErrors(ctx)}
      onChange={e => nicknameAtom(ctx, e.target.value)}
      placeholder="Никнейм"
      maxLength={32}
    />
  )
}, "Nickname")

const Password = reatomComponent(({ ctx }) => {
  const state = ctx.spy(errorTypeAtom).includes("password") ? "error" : "default"

  return (
    <Input
      className={authInput()}
      data-state={state}
      value={ctx.spy(passwordAtom)}
      onClick={() => resetErrors(ctx)}
      onChange={e => passwordAtom(ctx, e.target.value)}
      placeholder="Пароль"
      maxLength={64}
      type="password"
    />
  )
}, "Password")

const Findout = reatomComponent(({ ctx }) => {
  const state = ctx.spy(errorTypeAtom).includes("findout") ? "error" : "default"

  return (
    <Input
      className={authInput()}
      data-state={state}
      value={ctx.spy(findoutAtom)}
      onClick={() => resetErrors(ctx)}
      onChange={e => findoutAtom(ctx, e.target.value)}
      placeholder="Откуда узнали о проекте?"
      maxLength={128}
    />
  )
}, "Findout")

export const SubmitAuth = reatomComponent(({ ctx }) => {
  return (
    <Button
      variant="minecraft"
      className="bg-neutral-600 w-full rounded-lg"
      onClick={() => authorize(ctx)}
      disabled={ctx.spy(authorize.isLoading) || !ctx.spy(isValidAtom)}
    >
      <Typography className="font-semibold  text-lg">
        {ctx.spy(typeAtom) === 'register' ? "Зарегистрироваться" : "Войти"}
      </Typography>
    </Button>
  )
}, "Submit")

const ResetPassword = reatomComponent(({ ctx }) => {
  return (
    <Typography
      className='cursor-pointer text-center text-lg text-neutral-400'
      onClick={() => toast.warning("Пока не доступно.")}
    >
      Я забыл пароль
    </Typography>
  )
}, "ResetPassword")

const checkbox = tv({
  base: `peer h-5 w-5 lg:h-6 lg:w-6 cursor-pointer transition-all appearance-none
    rounded-lg shadow hover:shadow-md border-[2px] 
      border-neutral-600 bg-neutral-700 checked:bg-neutral-900 checked:border-black`
})

const PrivacyTerms = reatomComponent(({ ctx }) => {
  return (
    <div className="inline-flex gap-2 items-start">
      <label htmlFor="rules" className="flex items-center cursor-pointer relative">
        <input
          id="rules"
          checked={ctx.spy(acceptRulesAtom)}
          type="checkbox"
          className={checkbox()}
          onChange={e => acceptRulesAtom(ctx, e.target.checked)}
        />
        <span
          className="absolute text-white opacity-0 peer-checked:opacity-100
               top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            viewBox="0 0 20 20"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            ></path>
          </svg>
        </span>
      </label>
      <label className="select-none cursor-pointer relative -top-1" htmlFor="rules">
        <Typography className="text-base sm:text-lg">
          Я согласен(-на) с положениями
          <a href="/legal/terms" target="_blank" className="inline text-green-500">&nbsp;пользовательского соглашения</a>,
          <a href="/legal/privacy" target="_blank" className=" inline text-green-500">&nbsp;политикой конфиденциальности&nbsp;</a>
          и
          <a href="https://mc.fasberry.su/rules" target="_blank" className="inline text-green-500">&nbsp;правилами проекта</a>.
        </Typography>
      </label>
    </div>
  )
}, "PrivacyTerms")

export const RegisterForm = reatomComponent(({ ctx }) => {
  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <Nickname />
      <Password />
      <Findout />
      <PrivacyTerms />
    </div>
  )
}, "RegisterForm")

export const AuthError = reatomComponent(({ ctx }) => {
  const message = ctx.spy(globalErrorAtom)
  if (!message) return null;

  return (
    <Typography className='font-semibold text-base text-red-500'>
      {message}
    </Typography>
  )
}, "AuthError")

export const LoginForm = () => {
  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <Nickname />
      <Password />
      <ResetPassword />
    </div>
  )
}