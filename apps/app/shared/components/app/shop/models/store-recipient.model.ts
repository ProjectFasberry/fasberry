import { action, Atom, atom, batch, Ctx, CtxSpy } from "@reatom/core";
import z from "zod";
import { withLocalStorage } from "@reatom/persist-web-storage";
import { isDeepEqual, reatomAsync, sleep, withInit, withReset, withStatusesAtom } from "@reatom/framework";
import { cartDataAtom } from "./store-cart.model";
import { logError } from "@/shared/lib/log";
import { addItemToCartAction, updateCart } from "./store-item.model";
import { toast } from "sonner";
import { client, withJsonBody } from "@/shared/lib/client-wrapper";

function makeChangeValidator<T>(
  oldAtom: Atom<T>,
  newAtom: Atom<T>
): (ctx: CtxSpy) => boolean {
  return (ctx: CtxSpy): boolean => {
    const newValue = ctx.spy(newAtom) ?? ""
    const oldValue = ctx.spy(oldAtom)
    const unchanged = isDeepEqual(oldValue, newValue)
    const hasInput =
      typeof newValue === "string" ? newValue.length >= 1 : Boolean(newValue)

    return Boolean(hasInput && !unchanged)
  }
}

export function getRecipient(ctx: Ctx): string {
  const currentRecipient = ctx.get(setRecipientValueAtom);

  if (!currentRecipient) {
    const global = ctx.get(storeGlobalRecipientAtom);
    if (!global) throw new Error("Global recipient is not defined")
    return global;
  }

  return currentRecipient;
}

const DIALOG_HANDLING_TIMEOUT = 200

const nicknameSchema = z.string()
  .min(3, { error: "Минимум 3 символа" })
  .max(16, { error: "Максимум 16 символов" })
  .regex(/^[a-zA-Z0-9_]+$/, { error: "Только латинские буквы, цифры и подчёркивание" });

export const storeGlobalRecipientAtom = atom<string | null>(null, "storeGlobalRecipient").pipe(
  withLocalStorage({ key: "store-recipient" })
);

export const setRecipientDialogIsOpenAtom = atom(false, "setRecipientDialogIsOpen").pipe(withReset())
export const setRecipientIsSaveAtom = atom(false, "setRecipientIsSave").pipe(withReset())
export const setRecipientTempValueAtom = atom("", "setRecipientTempValue").pipe(withReset());
export const setRecipientValueAtom = atom<string | null>(null, "setRecipientValue").pipe(withReset())
export const setRecipientErrorAtom = atom<string | null>(null, "setRecipientError").pipe(withReset())
export const setRecipientItemIdAtom = atom<number | null>(null, "setRecipientItemIdAtom").pipe(withReset())

function validateRecipient(recipient: string | null) {
  const result = nicknameSchema.safeParse(recipient)
  return result
}

async function getExistNickname(nickname: string) {
  return client<string | null>(`validate-nickname/${nickname}`).exec()
}

const ERRORS: Record<string, string> = {
  "not-found": "Такой игрок не зарегистрирован"
}

export const saveRecipientAction = reatomAsync(async (ctx) => {
  const value = ctx.get(setRecipientTempValueAtom);

  const { success, error, data: validatedRecipient } = validateRecipient(value)

  if (!success) {
    setRecipientErrorAtom(ctx, z.treeifyError(error).errors[0])
    return
  }

  const existNickname = await getExistNickname(validatedRecipient)
  if (!existNickname) throw new Error("not-found")

  return existNickname
}, {
  name: "saveRecipientAction",
  onFulfill: async (ctx, nickname) => {
    if (!nickname) return;

    const isSave = ctx.get(setRecipientIsSaveAtom);

    if (isSave) {
      storeGlobalRecipientAtom(ctx, nickname)
    }

    setRecipientValueAtom(ctx, nickname)

    setRecipientDialogIsOpenAtom.reset(ctx);
    await ctx.schedule(() => sleep(DIALOG_HANDLING_TIMEOUT))

    const targetItemId = ctx.get(setRecipientItemIdAtom)
    if (!targetItemId) throw new Error("Target item id is not defined")

    batch(ctx, async () => {
      await addItemToCartAction(ctx, targetItemId)

      setRecipientItemIdAtom.reset(ctx)
      setRecipientIsSaveAtom.reset(ctx)
      setRecipientTempValueAtom.reset(ctx);
      setRecipientValueAtom.reset(ctx)
      setRecipientErrorAtom.reset(ctx)
    })
  },
  onReject: (ctx, e) => {
    if (e instanceof Error) {
      const message = ERRORS[e.message] ?? "Произошла ошибка"
      setRecipientErrorAtom(ctx, message)
    }
  }
}).pipe(withStatusesAtom())

//
export const changeRecipientIdAtom = atom<number | null>(null, "changeRecipientId").pipe(withReset())
export const changeRecipientTitleAtom = atom<string | null>(null, "changeRecipientTitle").pipe(withReset())
export const changeRecipientNewRecipientAtom = atom<string | null>(null, "changeRecipientNewRecipient").pipe(withReset())
export const changeRecipientOldRecipientAtom = atom<string | null>(null, "changeRecipientOldRecipient").pipe(withReset())
export const changeRecipientDialogIsOpenAtom = atom(false, "changeRecipientDialogIsOpen").pipe(withReset())
export const changeRecipientErrorAtom = atom<string | null>(null, "changeRecipientError").pipe(withReset())

export const changeRecipientAction = reatomAsync(async (ctx, id: number) => {
  const newRecipient = ctx.get(changeRecipientNewRecipientAtom)

  const { success, error, data: validatedRecipient } = validateRecipient(newRecipient)

  if (!success) {
    changeRecipientErrorAtom(ctx, z.treeifyError(error).errors[0])
    return;
  }

  const existNickname = await getExistNickname(validatedRecipient)
  if (!existNickname) throw new Error("not-found")

  const json = { id, key: "recipient", value: validatedRecipient };

  const result = await ctx.schedule(() =>
    client
      .post<string>("store/cart/edit")
      .pipe(withJsonBody(json))
      .exec()
  )

  return { id, result }
}, {
  name: "changeRecipientAction",
  onFulfill: async (ctx, res) => {
    if (!res) return;

    updateCart(ctx);

    changeRecipientDialogIsOpenAtom.reset(ctx)
    await ctx.schedule(() => sleep(DIALOG_HANDLING_TIMEOUT))

    batch(ctx, () => {
      changeRecipientIdAtom.reset(ctx)
      changeRecipientTitleAtom.reset(ctx)
      changeRecipientNewRecipientAtom.reset(ctx)
      changeRecipientOldRecipientAtom.reset(ctx)
      changeRecipientErrorAtom.reset(ctx)
    })

    toast.success("Изменения сохранены");
  },
  onReject: (ctx, e) => {
    logError(e)

    if (e instanceof Error) {
      const message = ERRORS[e.message] ?? "Произошла ошибка"
      changeRecipientErrorAtom(ctx, message)
    }
  }
}).pipe(withStatusesAtom())

export const changeRecipientIsValidAtom = atom<boolean>(
  makeChangeValidator(changeRecipientOldRecipientAtom, changeRecipientNewRecipientAtom),
  "changeRecipientIsValid"
)

export const changeRecipientOpenDialogAction = action(async (ctx, id: number) => {
  const item = ctx.get(cartDataAtom).find(d => d.id === id)
  if (!item) throw new Error('Item not found');

  const { recipient, title } = item;

  batch(ctx, () => {
    changeRecipientTitleAtom(ctx, title)
    changeRecipientIdAtom(ctx, id);
    changeRecipientOldRecipientAtom(ctx, recipient);
    changeRecipientNewRecipientAtom(ctx, recipient);
  })
  changeRecipientDialogIsOpenAtom(ctx, true)
}, "changeRecipientOpenDialogAction")

// 
export const changeGlobalRecipientOldAtom = atom<string | null>((ctx) => ctx.spy(storeGlobalRecipientAtom), "changeGlobalRecipientOld").pipe(
  withInit((ctx) => ctx.get(storeGlobalRecipientAtom))
)

export const changeGlobalRecipientNewAtom = atom<string | null>(null, "changeGlobalRecipientNew").pipe(withReset())
export const changeGlobalRecipientErrorAtom = atom<string | null>(null, "changeGlobalRecipientError").pipe(withReset())

export const changeGlobalRecipientIsValidAtom = atom<boolean>(
  makeChangeValidator(changeGlobalRecipientOldAtom, changeGlobalRecipientNewAtom),
  "changeGlobalRecipientIsValid"
)

export const changeGlobalRecipientAction = reatomAsync(async (ctx) => {
  const newRecipient = ctx.get(changeGlobalRecipientNewAtom)

  const { success, error, data: validatedRecipient } = validateRecipient(newRecipient)

  if (!success) {
    changeGlobalRecipientErrorAtom(ctx, z.treeifyError(error).errors[0])
    return;
  }

  const existNickname = await getExistNickname(validatedRecipient)
  if (!existNickname) throw new Error("not-found")

  return existNickname
}, {
  name: "changeGlobalRecipientAction",
  onFulfill: (ctx, nickname) => {
    if (!nickname) return;

    storeGlobalRecipientAtom(ctx, nickname)

    toast.success("Изменения сохранены")
  },
  onReject: (ctx, e) => {
    logError(e)

    if (e instanceof Error) {
      const message = ERRORS[e.message] ?? "Произошла ошибка"
      changeGlobalRecipientErrorAtom(ctx, message)
    }
  }
}).pipe(withStatusesAtom())