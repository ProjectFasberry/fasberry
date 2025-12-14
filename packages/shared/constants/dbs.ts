export const dbs: Record<string, { dialect: string; envVar: string; out: string }> = {
  general: { dialect: "postgres", envVar: "GENERAL_DATABASE_URL", out: "./types/db/auth-database-types.ts" },
  sqlite: { dialect: "sqlite", envVar: "SQLITE_DATABASE_URL", out: "./types/db/sqlite-database-types.ts" },
  payments: { dialect: "postgres", envVar: "PAYMENTS_DATABASE_URL", out: "./types/db/payments-database-types.ts" },
  skins: { dialect: "mysql", envVar: "SKINS_DATABASE_URL", out: "./types/db/skins-database-types.ts" },
  bisquite: { dialect: "mysql", envVar: "BISQUITE_DATABASE_URL", out: "./types/db/bisquite-database-types.ts" },
  lobby: { dialect: "mysql", envVar: "LOBBY_DATABASE_URL", out: "./types/db/lobby-database-types.ts" },
  luckperms: { dialect: "postgres", envVar: "LUCKPERMS_DATABASE_URL", out: "./types/db/luckperms-database-types.ts" },
  libertybans: { dialect: "postgres", envVar: "LIBERTYBANS_DATABASE_URL", out: "./types/db/libertybans-database-types.ts" },
} as const;