import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core"

export const minecraftNews = sqliteTable("minecraft_news", {
  id: integer().primaryKey(),
  title: text().notNull(),
  description: text().notNull(),
  mediaLinks: text("media_links"),
  tags: text(),
  createdAt: text("created_at").default("sql`(CURRENT_TIMESTAMP)`").notNull(),
  imageUrl: text().notNull(),
});