import { reatomAsync, withDataAtom, withStatusesAtom } from "@reatom/async";
import { sleep } from "@reatom/framework";

export const EVENTS = [
  {
    type: "register",
    log: `Игрок distribate зарегистрировался`
  },
  {
    type: "update-news",
    log: `Игрок distribate опубликовал новость`
  },
] as const;

export const eventsAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(async () => {
    await sleep(120);

    return EVENTS
  })
}).pipe(withDataAtom(), withStatusesAtom())
