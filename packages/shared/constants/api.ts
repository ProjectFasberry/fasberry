import ky from "ky"

export const MINECRAFT_API = ky.extend({
  prefixUrl: "https://api.fasberry.su/minecraft",
  credentials: "include"
})

export const FORUM_API = ky.extend({
  prefixUrl: "https://api.fasberry.su/forum",
  credentials: "include"
})

export const FORUM_SHARED_API = FORUM_API.extend({
  prefixUrl: "shared",
  credentials: "include"
})

export const CURRENCIES_API = ky.extend({
  prefixUrl: "https://api.fasberry.su/currencies",
  credentials: "include"
})

export const PAYMENTS_API = ky.extend({
  prefixUrl: "https://api.fasberry.su/payment/proccessing",
  credentials: "include"
})