import ky from "ky";

export const BASE = ky.extend({
  prefixUrl: import.meta.env.PUBLIC_ENV__API_PREFIX,
  credentials: "include"
})