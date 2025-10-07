import { toast } from "sonner";
import { createConsola } from "consola";

export const logger = createConsola()

export const routingLogger = logger.withTag("Routing")

export function logError(
  e: Error | unknown,
  { type = "console" }: { type?: "console" | "toast" | "combined" } = {}
) {
  if (e instanceof Error) {
    switch (type) {
      case "console":
        console.error(e.message)
        break;
      case "toast":
        toast(e.message);
        break;
      case "combined":
        toast(e.message);
        console.error(e.message)
        break;
      default:
        if (!type) console.warn("Skip logging. Log type is not defined")
        break;
    }
  }
}

export function logRouting(pathname: string, hook: string) {
  routingLogger.log(`${pathname} called +${hook}`);
}