import { t } from "elysia";

export const taskPayload = t.Object({
  id: t.Number(),
  description: t.String(),
  created_at: t.Date(),
  title: t.String(),
  expires: t.Union([t.String(), t.Date()]),
  action_type: t.String(),
  action_value: t.Union([t.String(), t.Null()]),
  reward_currency: t.String(),
  reward_value: t.Number(),
}) 