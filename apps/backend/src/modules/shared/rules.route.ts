import { throwError } from "#/helpers/throw-error";
import { sqlite } from "#/shared/database/sqlite-db";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { CacheControl } from "elysiajs-cdn-cache";
import { cacheSetup } from "../global/setup";

const ruleTypes: Record<"chat" | "game" | "based", string> = {
  'chat': 'Правила чата',
  'game': 'Игровые правила',
  'based': 'Основные правила проекта',
}

async function getRules() {
  const [rules, terms] = await Promise.all([
    sqlite
      .selectFrom("rules_content")
      .selectAll()
      .where("rule_list_id", "in", ["chat", "game", "based"])
      .execute(),
    sqlite
      .selectFrom("rules_termins")
      .selectAll()
      .execute()
  ])

  const termsResult = {
    categoryTitle: 'Терминология', content: terms,
  };

  const categorizedRules = ["chat", "game", "based"].reduce((acc, type) => {
    acc[type] = {
      categoryTitle: ruleTypes[type as "chat", "game", "based"],
      content: rules.filter((rule) => rule.rule_list_id === type),
    };

    return acc;
  }, {} as Record<string, { categoryTitle: string; content: any[] }>);

  return { rules: categorizedRules, terms: termsResult };
}

export const rules = new Elysia()
  .use(cacheSetup)
  .get("/rules", async (ctx) => {
    try {
      const data = await getRules()

      ctx.cacheControl.set(
        "Cache-Control",
        new CacheControl()
          .set("public", true)
          .set("max-age", 3600)
          .set("s-maxage", 3600)
      );

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  })