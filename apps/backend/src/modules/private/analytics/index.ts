import Elysia from "elysia"
import { validatePermission } from "#/lib/middlewares/validators";
import { PERMISSIONS } from "#/shared/constants/permissions";
import { analyticsRegistrations } from "./analytics-registrations.route";
import { analyticsActivity } from "./analytics-activity.route";

export const analytics = new Elysia()
  .use(validatePermission(PERMISSIONS.ANALYTICS.READ))
  .group("/analytics", app => app
    .use(analyticsRegistrations)
    .use(analyticsActivity)
  )