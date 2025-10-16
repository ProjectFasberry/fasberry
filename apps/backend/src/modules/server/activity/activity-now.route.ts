import { withData } from "#/shared/schemas";
import { PlayerActivityPayload } from "@repo/shared/types/entities/user";
import Elysia, { t } from "elysia";
import { getPlayerStatus } from "./activity.model";

export const activityNow = new Elysia()
  .model({
    "activity-now": withData(
      t.Object({
        nickname: t.String(),
        type: t.String(),
        issued_date: t.Union([t.Date(), t.Null()])
      })
    )
  })
  .get("/now/:nickname", async ({ params }) => {
    const nickname = params.nickname;
    const data: PlayerActivityPayload = await getPlayerStatus(nickname);
    return { data }
  }, {
    response: {
      200: "activity-now"
    }
  })