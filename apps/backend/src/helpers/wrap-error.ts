import { logger } from "#/utils/config/logger";

export function wrapError(e: unknown): { error: string } {
  let error = 'Internal Server Error';

  if (
    typeof e === 'object' &&
    e !== null &&
    'message' in e &&
    typeof (e as any).message === 'string'
  ) {
    try {
      const parsed = JSON.parse((e as any).message);
      
      if (typeof parsed === 'object' && parsed !== null) {
        return { error: parsed };
      }

      return { error: (e as any).message };
    } catch {
      return { error: (e as any).message };
    }
  }

  if (typeof e === 'string') {
    try {
      const parsed = JSON.parse(e);

      if (typeof parsed === 'object' && parsed !== null) {
        return { error: parsed };
      }

      return { error: e }; 
    } catch {
      return { error: e }; 
    }
  }

  logger.error(error)

  return { error };
}