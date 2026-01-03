import { toast } from "sonner";
import { createConsola } from "consola";
import { isDevelopment } from "../env";

export const logger = createConsola();
export const routingLogger = logger.withTag('Routing');

export function logError(
  e: unknown,
  { type = 'console' }: { type?: 'console' | 'toast' | 'combined' } = {}
) {
  if (!(e instanceof Error)) return;
  const msg = e.message;

  switch (type) {
    case 'console':
      console.error(msg);
      break;
    case 'toast':
      toast(msg);
      break;
    case 'combined':
      toast(msg);
      console.error(msg);
      break;
    default:
      console.warn('Skipped logging: invalid log type');
  }
}

export function logRouting(pathname: string, hook: string) {
  routingLogger.log(`${pathname} called +${hook}`);
}

export function devLog(...args: Parameters<typeof logger.log>) {
  if (isDevelopment) {
    logger.withTag("dev").log(...args)
  }
}