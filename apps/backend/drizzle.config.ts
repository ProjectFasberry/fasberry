import { defineConfig } from "drizzle-kit";
import path from "path"

const DATABASES = {
  general: {
    url: process.env.GENERAL_POSTGRES_DB_URL,
    dialect: "postgresql",
  },
  payments: {
    url: process.env.PAYMENTS_POSTGRES_DB_URL,
    dialect: "postgresql",
  },
  bisquite: {
    url: process.env.BISQUITE_MYSQL_DB_URL,
    dialect: "mysql",
  },
  luckperms: {
    url: process.env.LUCKPERMS_POSTGRES_DB_URL,
    dialect: "postgresql"
  },
  reputation: {
    url: process.env.REPUTATION_MYSQL_DB_URL,
    dialect: "mysql"
  },
  playerpoints: {
    url: process.env.PLAYERPOINTS_MYSQL_DB_URL,
    dialect: "mysql"
  },
  lobby: {
    url: process.env.LOBBY_MYSQL_DB_URL,
    dialect: "mysql"
  },
  skins: {
    url: process.env.SKINS_DATABASE_URL,
    dialect: "mysql"
  },
  sqlite: {
    url: path.resolve(__dirname, process.env.SQLITE_DATABASE_URL),
    dialect: "sqlite"
  }
} as const;

function getDatabase(db: keyof typeof DATABASES) {
  const creds = DATABASES[db];

  if (!creds?.url) {
    throw new Error(`Database URL for "${db}" is not defined`);
  }

  return {
    url: creds.url,
    dialect: creds.dialect,
  };
}

const selectedDatabase = getDatabase("general");

console.log(`Selected database in drizzle: ${selectedDatabase.dialect} ${selectedDatabase.url}`)

export default defineConfig({
  schema: "./src/drizzle/schema.ts",
  out: "./src/drizzle",
  dialect: selectedDatabase.dialect,
  dbCredentials: {
    url: selectedDatabase.url,
  }
});