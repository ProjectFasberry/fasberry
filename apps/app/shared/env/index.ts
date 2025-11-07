export const SENTRY_PUBLIC_DSN = import.meta.env.VITE_PUBLIC_ENV__SENTRY_DSN

export const isProduction = import.meta.env.PROD
export const isDevelopment = import.meta.env.DEV

export const HOST = import.meta.env.VITE_APP_HOST
export const PORT = import.meta.env.VITE_APP_PORT

export const API_PREFIX_URL = import.meta.env.VITE_API_PREFIX

export const LANDING_ENDPOINT = import.meta.env.VITE_LANDING_ENDPOINT

export const VOLUME_PREFIX = import.meta.env.VITE_VOLUME_PREFIX

export const CAP_INSTANCE_URL = import.meta.env.VITE_CAP_INSTANCE_URL
export const CAP_SITEKEY = import.meta.env.VITE_CAP_SITE_KEY