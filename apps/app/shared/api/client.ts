import ky from "ky";
import { API_PREFIX_URL } from "../env";

export const client = ky.extend({
  prefixUrl: API_PREFIX_URL,
  credentials: "include",
  timeout: 4000
})