export function safeJsonParse<T>(str: string): { ok: true; value: T } | { ok: false; error: Error } {
  try {
    return { ok: true, value: JSON.parse(str) as T };
  } catch (err) {
    return { ok: false, error: err as Error };
  }
}

export function wrapMeta(res: Partial<PaginatedMeta>): PaginatedMeta {
  return {
    hasNextPage: res.hasNextPage ?? false,
    hasPrevPage: res.hasPrevPage ?? false,
    endCursor: res.endCursor,
    startCursor: res.startCursor
  }
}

export function buildUpdates<T extends Record<string, any>>(
  entries: { field: keyof T; value: T[keyof T] }[]
): Partial<T> {
  const result: Partial<T> = {}
  for (const { field, value } of entries) {
    result[field] = value
  }
  return result
}
