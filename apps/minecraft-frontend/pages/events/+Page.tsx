// import { Typography } from '@repo/ui/src/components/typography'
// import { BlockWrapper } from '#components/wrappers/components/block-wrapper'
// // @ts-ignore
// import FishingRod from "@repo/assets/images/minecraft/fishing_rod.webp"
// import { Button } from '@repo/ui/src/components/button'
// import { Dialog, DialogContent, DialogTrigger } from '@repo/ui/src/components/dialog'
// import CharismIcon from "@repo/assets/images/minecraft/charism_wallet.png"
// import Events from "@repo/assets/images/looking.jpg"
// import { Head } from '@unhead/react'

// const EventsNotFound = () => {
//   return (
//     <div className="flex w-full items-center justify-center h-full gap-12 px-12 py-6 relative">
//       <div className="flex flex-col items-center gap-y-4">
//         <img src={Events} alt="" width={256} height={256} />
//         <Typography className="text-xl font-bold text-shark-50">
//           Ивентов пока нет
//         </Typography>
//       </div>
//     </div>
//   )
// }

// const Charism = ({ amount }: { amount: number }) => {
//   return (
//     <div className="flex items-center gap-1">
//       <img src={CharismIcon} alt="" width={32} height={32} />
//       <Typography textSize="large">
//         {amount}
//       </Typography>
//     </div>
//   )
// }

// const ExampleEvent = () => {
//   return (
//     <div className="flex flex-col items-center 2xl:aspect-square gap-4 w-full rounded-md p-2 bg-shark-950">
//       <div className="border border-shark-700 w-full flex items-center justify-center rounded-md p-4">
//         <img src={FishingRod} alt="" width={96} height={96} />
//       </div>
//       <div className="flex flex-col justify-start w-full">
//         <Typography textSize="large" className="font-semibold">
//           Проголосовать за сервер
//         </Typography>
//         <Typography textColor="gray">
//           Отдайте голос самому лучшему серверу!
//         </Typography>
//       </div>
//       <div className="flex flex-col lg:flex-row lg:items-center lg:gap-2 gap-2 lg:justify-end w-full">
//         <Dialog>
//           <DialogTrigger asChild>
//             <Button state="default" className="w-full lg:w-fit">
//               <Typography textSize="medium">
//                 Награда
//               </Typography>
//             </Button>
//           </DialogTrigger>
//           <DialogContent>
//             <div className="flex flex-col gap-y-4 items-center justify-center w-full">
//               <Typography variant="dialogTitle">
//                 Ивент: Проголосовать за сервер
//               </Typography>
//               <div className="flex flex-col gap-2 p-2 w-full">
//                 <Typography textSize="medium">
//                   Награда:
//                 </Typography>
//                 <Charism amount={25} />
//               </div>
//             </div>
//           </DialogContent>
//         </Dialog>
//         <a href="https://hotmc.ru/minecraft-server-259308" target="_blank" rel="noreferrer">
//           <Button variant="positive" className="w-full lg:w-fit" >
//             <Typography textSize="medium">
//               Отдать голос
//             </Typography>
//           </Button>
//         </a>
//       </div>
//     </div>
//   )
// }

// export function EventsRouteComponent() {
//   return (
//     <div className="flex lg:flex-row flex-col w-full min-h-dvh gap-2">
//       <Head>
//         <title>Ивенты</title>
//       </Head>
//       <BlockWrapper className="flex flex-col gap-y-4 w-full !p-4">
//         <Typography textSize="very_big" textColor="shark_white" className="font-semibold">
//           Ивенты
//         </Typography>
//         <div className="flex flex-col gap-2 w-full h-full">
//           <Typography textSize="big">
//             Системные
//           </Typography>
//           <div className="grid lg:grid-cols-3 2xl:grid-cols-5 auto-rows-auto gap-4 w-full">
//             <ExampleEvent />
//           </div>
//         </div>
//       </BlockWrapper>
//     </div>
//   )
// }