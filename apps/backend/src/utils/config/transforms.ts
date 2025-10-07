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