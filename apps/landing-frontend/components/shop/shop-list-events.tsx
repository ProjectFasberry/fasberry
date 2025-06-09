import { Typography } from "@repo/landing-ui/src/typography";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Events = {
  type: string;
  title: string;
  description: string;
  wallet: string;
  price: number;
}

// async function postEventSuggest(val: Omit<Events, "type">) {
//   return []
// }

// const useEventSuggest = () => {
//   const qc = useQueryClient()

//   const createNewEventSuggestMutation = useMutation({
//     mutationFn: async (val: Omit<Events, "type">) => {
//       return postEventSuggest(val)
//     },
//     onError: (e) => {
//       throw new Error(e.message);
//     },
//   })

//   return { createNewEventSuggestMutation }
// }

// export const EventSuggest = () => {
//   const { createNewEventSuggestMutation } = useEventSuggest()

//   return (
//     <div
//       className="flex items-center justify-center w-full h-16 gap-4 cursor-pointer bg-neutral-800 hover:bg-neutral-700 p-2 rounded-lg"
//     >
//       <Typography className="text-[20px]">
//         Предложить ивент
//       </Typography>
//     </div>
//   )
// }

export const EventsList = () => {
  return (
    <div className="flex items-start justify-center w-full gap-4">
      <Typography className="text-3xl">
        Пусто
      </Typography>
    </div>
  )
}