import ky from "ky";

export const client = ky.extend({
  prefixUrl: import.meta.env.PUBLIC_ENV__API_PREFIX,
  credentials: "include"  
})