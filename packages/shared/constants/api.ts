import ky from "ky"

const API = ky.create({ prefixUrl: 'https://api.fasberry.su' });

const PAYMENT_API = API.extend((opts) => ({ prefixUrl: `${opts.prefixUrl}/payment` }))

export const CURRENCIES_API = PAYMENT_API.extend((opts) => ({
  prefixUrl: `${opts.prefixUrl}/currencies`,
}))

export const PAYMENTS_API = PAYMENT_API.extend((opts) => ({
  prefixUrl: `${opts.prefixUrl}/proccessing`,
  credentials: "include"
}))