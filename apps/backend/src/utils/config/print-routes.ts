import { App } from "#/index";
import { logger } from "./logger";

export function showRoutes(app: App) {
  for (const { path, method } of app.routes) {
    logger
      .withTag("App")
      .log(`${path} - ${method}`)
  }
}