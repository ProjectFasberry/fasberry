import Elysia from "elysia";
import { general } from "#/shared/database/main-db";
import { HttpStatusEnum } from "elysia-http-status-code/status";

const ruleTypes: Record<"chat" | "game" | "based", string> = {
  'chat': 'Правила чата',
  'game': 'Игровые правила',
  'based': 'Основные правила проекта',
}

async function getRules() {
  const [rules, terms] = await Promise.all([
    general
      .selectFrom("rules")
      .selectAll()
      .where("rule_list_id", "in", ["chat", "game", "based"])
      .execute(),
    general
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
  .get("/rules", async ({ status, set }) => {
    const data = await getRules()

    set.headers["Cache-Control"] = "public, max-age=3600, s-maxage=3600"

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  })