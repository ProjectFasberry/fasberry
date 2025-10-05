import { App } from "#/index";
import { logger } from "./logger";

export function showRoutes(app: App) {
  for (const route of app.routes) {
    logger
      .withTag("App")
      .log(route.path)
  }
}