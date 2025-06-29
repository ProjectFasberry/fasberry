import { Context } from "elysia";

export function throwError(e: unknown): { error: string } {
  let error = 'Internal Server Error';

  if (
    typeof e === 'object' &&
    e !== null &&
    'message' in e &&
    typeof { error: (e as any).message === 'string' }
  ) {
    return { error: (e as { message: string }).message }
  }

  if (typeof e === 'string') {
    return { error: e };
  }

  return { error };
}