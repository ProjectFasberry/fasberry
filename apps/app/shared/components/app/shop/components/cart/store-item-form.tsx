import { toast } from 'sonner';
import { reatomComponent } from '@reatom/npm-react';
import { Typography } from '@repo/ui/typography';
import { spawn } from '@reatom/framework';
import { Button } from '@repo/ui/button';
import { FormEvent } from 'react';
import { createPaymentAction, storePrivacyAtom } from '../../models/store.model';
import { StorePrice } from './store-price';

const PrivacyField = reatomComponent(({ ctx }) => {
  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center gap-2">
        <label
          onClick={() => storePrivacyAtom(ctx, (state) => !state)}
          htmlFor="privacy"
          className="flex items-center cursor-pointer relative"
        >
          <input
            id="privacy"
            checked={ctx.spy(storePrivacyAtom)}
            type="checkbox"
            className="peer h-6 w-6 cursor-pointer transition-all appearance-none
                  rounded shadow hover:shadow-md border-[2px]
                  border-neutral-600 bg-neutral-700 checked:bg-neutral-700 "
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
          <Typography className="text-sm tracking-tight leading-3 lg:text-base break-words font-semibold">
            Я согласен с&nbsp;
            <a href="https://mc.fasberry/rules" target="_blank" className="text-green-500">
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