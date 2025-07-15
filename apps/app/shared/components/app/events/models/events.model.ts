import { reatomResource, withDataAtom, withStatusesAtom } from "@reatom/async";
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

export const eventsAction = reatomResource(async (ctx) => {
  return await ctx.schedule(async () => {
    await sleep(120);

    return EVENTS
  })
}, "eventsAction").pipe(withDataAtom(), withStatusesAtom())