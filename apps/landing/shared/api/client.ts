import ky from "ky";

export const BASE = ky.extend({
  prefixUrl: process.env.NODE_ENV === 'development' ? "http://localhost:4104/minecraft/" : "https://api.fasberry.su/minecraft/",
  credentials: "include"
})