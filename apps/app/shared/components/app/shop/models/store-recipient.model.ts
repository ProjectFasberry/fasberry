import { action, atom, batch, Ctx } from "@reatom/core";
import z from "zod";
import { withLocalStorage } from "@reatom/persist-web-storage";
import { isDeepEqual, reatomAsync, sleep, withReset, withStatusesAtom } from "@reatom/framework";
import { cartDataAtom } from "./store-cart.model";
import { logError } from "@/shared/lib/log";
import { updateCart } from "./store-item.model";
import { toast } from "sonner";
import { client, withJsonBody } from "@/shared/lib/client-wrapper";

const nicknameSchema = z.string()
  .min(3, { error: "Минимум 3 символа" })
  .max(16, { error: "Максимум 16 символов" })
  .regex(/^[a-zA-Z0-9_]+$/, { error: "Только латинские буквы, цифры и подчёркивание" });

export const storeRecipientAtom = atom<string | null>(null).pipe(withLocalStorage({ key: "store-recipient" }));

export const setRecipientDialogIsOpenAtom = atom(false, "setRecipientDialogIsOpen").pipe(withReset())
export const setRecipientIsSaveAtom = atom(false, "setRecipientIsSave").pipe(withReset())
export const setRecipientTempValueAtom = atom("", "setRecipientTempValue").pipe(withReset());
export const setRecipientValueAtom = atom<string | null>(null, "setRecipientValue").pipe(withReset())
export const setRecipientErrorAtom = atom<string | null>(null, "setRecipientError").pipe(withReset())

setRecipientDialogIsOpenAtom.onChange((ctx, state) => {
  if (!state) {
    batch(ctx, () => {
      setRecipientIsSaveAtom.reset(ctx);
      setRecipientTempValueAtom.reset(ctx)
      setRecipientValueAtom.reset(ctx)
      setRecipientErrorAtom.reset(ctx)
    })
  }
})

function validateRecipient(recipient: string | null) {
  const result = nicknameSchema.safeParse(recipient)
  return result
}

export const saveRecipientAction = reatomAsync(async (ctx) => {
  const isSave = ctx.get(setRecipientIsSaveAtom);
  const value = ctx.get(setRecipientTempValueAtom);

  const { success, error, data } = validateRecipient(value)

  if (!success) {
    setRecipientErrorAtom(ctx, z.prettifyError(error))
    return;
  }

  const isError = ctx.get(setRecipientErrorAtom)
  if (isError) return;

  if (isSave) {
    storeRecipientAtom(ctx, data)
  }

  setRecipientValueAtom(ctx, data)

  // reset
  setRecipientDialogIsOpenAtom.reset(ctx);
  await ctx.schedule(() => sleep(200));
  setRecipientIsSaveAtom.reset(ctx)
  setRecipientTempValueAtom.reset(ctx);
}, "saveRecipientAction").pipe(withStatusesAtom())

export function getRecipient(ctx: Ctx): string {
  const currentRecipient = ctx.get(setRecipientValueAtom);

  if (!currentRecipient) {
    const global = ctx.get(storeRecipientAtom);
    if (!global) throw new Error("Global recipient is not defined")

    return global;
  }

  return currentRecipient;
}

export const changeRecipientIdAtom = atom<number | null>(null, "changeRecipientId").pipe(withReset())
export const changeRecipientTitleAtom = atom<string | null>(null, "changeRecipientTitle").pipe(withReset())
export const changeRecipientNewRecipientAtom = atom<string | null>(null, "changeRecipientNewRecipient").pipe(withReset())
export const changeRecipientOldRecipientAtom = atom<string | null>(null, "changeRecipientOldRecipient").pipe(withReset())
export const changeRecipientDialogIsOpenAtom = atom(false, "changeRecipientDialogIsOpen").pipe(withReset())
export const changeRecipientErrorAtom = atom<string | null>(null, "changeRecipientError").pipe(withReset())

changeRecipientDialogIsOpenAtom.onChange((ctx, state) => {
  if (!state) {
    batch(ctx, () => {
      changeRecipientIdAtom.reset(ctx)
      changeRecipientTitleAtom.reset(ctx)
      changeRecipientNewRecipientAtom.reset(ctx)
      changeRecipientOldRecipientAtom.reset(ctx)
      changeRecipientErrorAtom.reset(ctx)
    })
  }
})

export const changeRecipientAction = reatomAsync(async (ctx, id: number) => {
  const newRecipient = ctx.get(changeRecipientNewRecipientAtom)

  const { success, error, data: validatedRecipient } = validateRecipient(newRecipient)

  if (!success) {
    changeRecipientErrorAtom(ctx, z.prettifyError(error))
    return;
  }

  const isError = ctx.get(changeRecipientErrorAtom)
  if (isError) return;

  const json = { id, key: "for", value: validatedRecipient };

  const result = await ctx.schedule(() =>
    client
      .post<string>("store/cart/edit")
      .pipe(withJsonBody(json))
      .exec()
  )

  return { id, result }
}, {
  name: "changeRecipientAction",
  onFulfill: (ctx, res) => {
    if (!res) return;

    batch(ctx, () => {
      updateCart(ctx)
      changeRecipientDialogIsOpenAtom.reset(ctx)
    })

    toast.success("Изменения сохранены");
  },
  onReject: (_, e) => {
    logError(e)
  }
}).pipe(withStatusesAtom())

export const changeRecipientIsValidAtom = atom<boolean>((ctx) => {
  const newValue = ctx.spy(changeRecipientNewRecipientAtom) ?? ""
  const oldValue = ctx.spy(changeRecipientOldRecipientAtom)
  const isEqual = isDeepEqual(oldValue, newValue)

  const result = newValue.length >= 1 ? isEqual : true

  return !result
}, "changeRecipientIsValid")

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