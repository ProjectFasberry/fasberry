import { reatomAsync } from "@reatom/async"

const eventsAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(() => {})
})

export const Events = () => {
  return (
    <>
    </>
  )
}

export const Entities = () => {
  return (
    <>
      <Events />
    </>
  )
}