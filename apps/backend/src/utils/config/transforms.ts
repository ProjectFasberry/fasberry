export function safeJsonParse<T>(str: string): { ok: true; value: T } | { ok: false; error: Error } {
  try {
    return { ok: true, value: JSON.parse(str) as T };
  } catch (err) {
    return { ok: false, error: err as Error };
  }
}