import ky from "ky";

const URL: Record<string, string> = {
  "production": "https://api.fasberry.su/minecraft/",
  "development": "http://localhost:4104/minecraft/"
}

export const client = ky.extend({
  prefixUrl: URL[process.env.NODE_ENV!],
  credentials: "include"  
})