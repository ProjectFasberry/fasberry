import { reatomComponent } from "@reatom/npm-react";
import { authorize, nicknameAtom, passwordAtom, } from "../models/auth.model";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input"

const Nickname = reatomComponent(({ ctx }) => {
  return (
    <Input
      value={ctx.spy(nicknameAtom)}
      placeholder="Nickname"
      maxLength={32}
      onChange={e => nicknameAtom(ctx, e.target.value)}
    />
  )
}, "Nickname")

const Password = reatomComponent(({ ctx }) => {
  return (
    <Input
      value={ctx.spy(passwordAtom)}
      placeholder="Password"
      maxLength={128}
      onChange={e => passwordAtom(ctx, e.target.value)}
    />
  )
}, "Password")

export const SubmitAuth = reatomComponent(({ ctx }) => {
  return (
    <Button
      variant="minecraft"
      disabled={ctx.spy(authorize.statusesAtom).isPending}
      onClick={() => authorize(ctx)}
      className="bg-neutral-800"
    >
      submit
    </Button>
  )
}, "Submit")

export const RegisterForm = reatomComponent(({ ctx }) => {
  return (
    <div className="flex flex-col gap-1 w-full h-full">
      <Nickname />
      <Password />
    </div>
  )
}, "RegisterForm")

export const LoginForm = reatomComponent(({ ctx }) => {
  return (
    <div className="flex flex-col gap-1 w-full h-full">
      <Nickname />
      <Password />
    </div>
  )
}, "LoginForm")