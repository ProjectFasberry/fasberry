import { DATABASES } from "#/shared/constants/databases";
import { defineConfig } from "drizzle-kit";

let target = process.env.target as keyof typeof DATABASES
let database = DATABASES[target] ?? undefined;
if (!database) {
  throw new Error(`Database "${target}" not found`);
}

console.log(`[Studio]: Selected database "${target}" (dialect=${database.dialect})`)

export default defineConfig({
  schema: "./src/drizzle/schema.ts",
  out: "./src/drizzle",
  dialect: database.dialect,
  dbCredentials: {
    url: database.url,
  }
});