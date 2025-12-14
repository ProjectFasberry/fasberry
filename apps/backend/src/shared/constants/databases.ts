import path from "node:path"

export const DATABASES: Record<string, { url: string, dialect: "postgresql" | "mysql" | "sqlite" }> = {
  general: {
    url: process.env.GENERAL_POSTGRES_DB_URL, dialect: "postgresql",
  },
  bisquite: {
    url: process.env.BISQUITE_MYSQL_DB_URL, dialect: "mysql",
  },
  plan: {
    url: process.env.PLAN_MYSQL_DB_URL, dialect: "mysql",
  },
  luckperms: {
    url: process.env.LUCKPERMS_POSTGRES_DB_URL, dialect: "postgresql"
  },
  libertybans: {
    url: process.env.LIBERTYBANS_DATABASE_URL, dialect: "postgresql"
  },
  reputation: {
    url: process.env.REPUTATION_MYSQL_DB_URL, dialect: "mysql"
  },
  playerpoints: {
    url: process.env.PLAYERPOINTS_MYSQL_DB_URL, dialect: "mysql"
  },
  lobby: {
    url: process.env.LOBBY_MYSQL_DB_URL, dialect: "mysql"
  },
  skins: {
    url: process.env.SKINS_DATABASE_URL, dialect: "mysql"
  },
  sqlite: {
    url: path.resolve(__dirname, process.env.SQLITE_DATABASE_URL), dialect: "sqlite"
  }
}