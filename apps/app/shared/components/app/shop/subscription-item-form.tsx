import { toast } from 'sonner';
import { ShopPrice } from './shop-price';
import { reatomComponent } from '@reatom/npm-react';
import { Typography } from '@repo/ui/typography';
import { createPaymentAction, privacyAtom, storeCurrencyAtom, storeItem, storeTargetNickname } from './store.model';
import { atom, spawn } from '@reatom/framework';
import { Button } from '@repo/ui/button';
import { FormEvent } from 'react';

const isValidAtom = atom<boolean>((ctx) => {
  const shopItemState = ctx.spy(storeItem);
  const nickname = ctx.spy(storeTargetNickname)
  const currency = ctx.spy(storeCurrencyAtom)
  const privacy = ctx.spy(privacyAtom)

  const isValid = shopItemState
    ? (nickname.length >= 1)
    && currency
    && (shopItemState.paymentValue !== null)
    && (shopItemState.paymentType !== null)
    && privacy
    : false;

  return isValid
})

const PrivacyField = reatomComponent(({ ctx }) => {
  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center gap-2">
        <label
          onClick={() => privacyAtom(ctx, (state) => !state)}
          htmlFor="privacy"
          className="flex items-center cursor-pointer relative"
        >
          <input
            id="privacy"
            checked={ctx.spy(privacyAtom)}
            type="checkbox"
            className="peer h-6 w-6 cursor-pointer transition-all appearance-none
                  rounded shadow hover:shadow-md border-[2px]
                  border-neutral-600 bg-neutral-700 checked:bg-neutral-900 checked:border-black"
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
        <label htmlFor="privacy" className="cursor-pointer w-full select-none">
          <Typography className="text-[14px] tracking-tight leading-3 lg:text-[16px] break-words">
            Я согласен с&nbsp;
            <a href="/rules" target="_blank" className="text-red">
              правилами&nbsp;
            </a>
            проекта.
          </Typography>
        </label>
      </div>
    </div>
  )
}, "PrivacyField")

// const EmailField = reatomComponent(({ ctx }) => {
//   return (
//     <div className="flex flex-col gap-y-2">
//       <div className="flex items-start gap-x-2">
//         <Typography
//           color="white"
//           className="text-[14px] tracking-tight leading-3 lg:text-[16px] break-words"
//         >
//           Почта
//         </Typography>
//       </div>
//       <Input
//         className="px-4"
//         placeholder="Почта"
//         value=""
//       />
//     </div>
//   )
// }, "EmailField")

export const SubscriptionItemForm = reatomComponent(({ ctx }) => {
  const isValid = ctx.spy(isValidAtom)

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const privacy = ctx.get(privacyAtom)

    if (!privacy) return toast.error("Вы не приняли условия")

    void spawn(ctx, async (spawnCtx) => createPaymentAction(spawnCtx));
  };

  return (
    <form onSubmit={(e) => onSubmit(e)} className="flex flex-col justify-between gap-y-6 pt-2">
      <PrivacyField />
      <div className="flex flex-col lg:flex-row items-center gap-2 w-full">
        <div className="flex items-center gap-2 justify-center bg-neutral-600/40 p-2 w-full lg:w-1/2 rounded-lg">
          <Typography className='text-lg'>Итого:</Typography>
          <ShopPrice />
        </div>
        <Button
          disabled={!isValid} className="w-full lg:w-1/2 hover:bg-[#05b458] bg-[#088d47]"
        >
          <Typography color="white" className="text-lg">Купить</Typography>
        </Button>
      </div>
    </form>
  );
}, "SubscriptionItemForm")