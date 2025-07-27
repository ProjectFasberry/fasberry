import { defineConfig } from "drizzle-kit";
import path from "path"

export default defineConfig({
  schema: "./src/drizzle/schema.ts",
  out: "./src/drizzle",
  // dialect: "sqlite",
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.PAYMENTS_POSTGRES_DB_URL,
    // url: process.env.AUTHORIZATION_POSTGRES_DB_URL,
    // url: path.resolve(__dirname, process.env.SQLITE_DATABASE_URL)
  }
});