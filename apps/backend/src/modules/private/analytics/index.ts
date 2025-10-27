import Elysia from "elysia"
import { validatePermission } from "#/lib/middlewares/validators";
import { PERMISSIONS } from "#/shared/constants/permissions";
import { registrations } from "./analytics-registrations.route";

export const analytics = new Elysia()
  .use(validatePermission(PERMISSIONS.ANALYTICS.READ))
  .group("/analytics", app => app
    .use(registrations)
  )