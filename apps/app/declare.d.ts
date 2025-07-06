declare global {
  declare module "*.jpg"

  type WrappedResponse<T> = { data: T } | { error: string }

  interface PaginatedMeta {
    hasNextPage: false,
    hasPrevPage: false,
    endCursor?: string,
    startCursor?: string
  }
}

export { }