import type { App } from "#/app";
import { appLogger } from "./logger";

export function showRoutes({ routes }: App) {
  for (const { path, method } of routes) {
    appLogger.log(`${path} - ${method}`)
  }

  appLogger.log(`Total ${routes.length} a routes`)
}