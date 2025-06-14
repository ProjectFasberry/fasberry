import ky from "ky"

const API = ky.create({ prefixUrl: 'https://api.fasberry.su' });

const FORUM_API = API.extend((opts) => ({ prefixUrl: `${opts.prefixUrl}/forum`, }))
const PAYMENT_API = API.extend((opts) => ({ prefixUrl: `${opts.prefixUrl}/payment` }))
const MINECRAFT_API = API.extend((opts) => ({ prefixUrl: `${opts.prefixUrl}/minecraft` }))

export const FORUM_USER_API = FORUM_API.extend((opts) => ({
  prefixUrl: `${opts.prefixUrl}/user`,
  credentials: "include"
}))

export const FORUM_SHARED_API = FORUM_API.extend((opts) => ({
  prefixUrl: `${opts.prefixUrl}/shared`,
  credentials: "include"
}))

export const MINECRAFT_SKIN_API = MINECRAFT_API.extend((opts) => ({
  prefixUrl: `${opts.prefixUrl}/skin`,
}))

export const MINECRAFT_LANDS_API = MINECRAFT_API.extend((opts) => ({
  prefixUrl: `${opts.prefixUrl}/lands`,
  credentials: "include"
}))

export const CURRENCIES_API = PAYMENT_API.extend((opts) => ({
  prefixUrl: `${opts.prefixUrl}/currencies`,
}))

export const PAYMENTS_API = PAYMENT_API.extend((opts) => ({
  prefixUrl: `${opts.prefixUrl}/proccessing`,
  credentials: "include"
}))