import ky from "ky";

export const BASE = ky.extend({
  prefixUrl: process.env.NODE_ENV === 'development' ? "http://localhost:4104/minecraft/v2" : "https://api.fasberry.su/minecraft/v2",
  credentials: "include"
})