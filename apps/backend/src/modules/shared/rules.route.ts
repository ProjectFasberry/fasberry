import { throwError } from "#/helpers/throw-error";
import { main } from "#/shared/database/main-db";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";

const ruleTypes: Record<"chat" | "game" | "based", string> = {
  'chat': 'Правила чата',
  'game': 'Игровые правила',
  'based': 'Основные правила проекта',
}

async function getRules() {
  const [rules, terms] = await Promise.all([
    main
      .selectFrom("rules")
      .selectAll()
      .where("rule_list_id", "in", ["chat", "game", "based"])
      .execute(),
    main
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
  .get("/rules", async (ctx) => {
    try {
      const data = await getRules()

      ctx.set.headers["Cache-Control"] = "public, max-age=3600, s-maxage=3600"

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  })