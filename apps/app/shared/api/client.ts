// import { treaty } from "@elysiajs/eden"
// import { type App } from '@backend'
import ky from "ky";

// export const client = treaty<App>("http://localhost:4104/");

// const a = reatomAsync(async (ctx) => {
//   const data = await client.minecraft.v2.get()

//   console.log(data)
// })

const URL = process.env.NODE_ENV === 'development' ? "http://localhost:4104/minecraft/v2" : "https://api.fasberry.su/minecraft/v2"

export const BASE = ky.extend({
  prefixUrl: URL,
  credentials: "include"  
})