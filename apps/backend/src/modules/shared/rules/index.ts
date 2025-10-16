import Elysia, { t } from "elysia";
import { general } from "#/shared/database/main-db";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { withData } from "#/shared/schemas";

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

const rulesPayload = t.Object({
  rules: t.Record(
    t.String(),
    t.Object({
      categoryTitle: t.String(),
      content: t.Array(t.Unknown())
    })
  ),
  terms: t.Object({
    categoryTitle: t.String(),
    content: t.Array(
      t.Object({
        id: t.Number(),
        article_desc: t.String(),
        article_title: t.String(),
      })
    )
  })
})

export const rules = new Elysia()
  .get("/rules", async ({ status, set }) => {
    const data = await getRules()

    set.headers["Cache-Control"] = "public, max-age=60, s-maxage=60"
    set.headers["vary"] = "Origin";

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    response: {
      200: withData(rulesPayload)
    }
  })