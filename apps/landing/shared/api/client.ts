// import { edenTreaty } from "@elysiajs/eden"
// import { type App } from '@/backend'
import ky from "ky";

// const client = edenTreaty<App>("localhost:4104");

// const data = await client.get()

export const BASE = ky.extend({
  prefixUrl: process.env.NODE_ENV === 'development' ? "http://localhost:4104/minecraft/v2" : "https://api.fasberry.su/minecraft/v2",
  credentials: "include"
})