// import dayjs from '@repo/lib/constants/dayjs-instance'
// import { Typography } from '@repo/ui/src/components/typography'
// import { Button } from '@repo/ui/src/components/button'
// import { reatomComponent } from '@reatom/npm-react'
// import { atom } from '@reatom/core'
// import { logoutAction } from '#components/modals/action-confirmation/components/logout/models/logout.model'

// type Banned = {
//   reason: string
//   time: string
//   created_at: string
// }

// const bannedAtom = atom<Banned | null>(null, "banned")

// const BannedActionButton = reatomComponent(({ ctx }) => {
//   const isLoading = ctx.spy(logoutAction.statusesAtom).isPending;
//   const isError = ctx.spy(logoutAction.statusesAtom).isRejected

//   return (
//     <Button
//       rounded="none"
//       variant="minecraft"
//       state="default"
//       disabled={isLoading || ctx.spy(logoutAction.statusesAtom).isFulfilled}
//       pending={isLoading || isError}
//       onClick={() => logoutAction(ctx)}
//     >
//       Выйти из аккаунта
//     </Button>
//   );
// }, "BannedActionButton")

// const Banned = reatomComponent(({ ctx }) => {
//   const data = ctx.spy(bannedAtom)

//   return (
//     <div className="flex flex-col gap-y-4 items-center relative">
//       <Typography
//         textSize="medium"
//         textColor="gray"
//         className="font-semibold"
//       >
//         Соединение потеряно
//       </Typography>
//       <div className="flex flex-col items-center gap-y-4">
//         <Typography
//           textSize="medium"
//           className="font-semibold text-red-500"
//         >
//           Вы были заблокированы на форуме.
//         </Typography>
//         <div className="flex flex-col items-center">
//           <Typography
//             textSize="medium"
//             className="font-semibold text-red-500"
//           >
//             Причина: <span className="text-shark-50">{data?.reason}</span>
//           </Typography>
//           <Typography
//             textSize="medium"
//             className="font-semibold text-red-500"
//           >
//             Разбан:{' '}
//             <span className="text-shark-50">
//               {dayjs(data?.time).format('DD.MM.YYYY HH:mm')}
//             </span>
//           </Typography>
//         </div>
//         <div className="w-full *:w-full">
//           <BannedActionButton />
//         </div>
//       </div>
//     </div>
//   )
// })

// export function BannedRouteComponent() {
//   return (
//     <div className="flex w-full relative h-screen items-center justify-center">
//       <Banned />
//     </div>
//   )
// }