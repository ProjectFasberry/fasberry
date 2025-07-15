declare global {
  declare module "*.jpg"
  declare module "*.png"
  declare module "*.gif"

  type WrappedResponse<T> = { data: T } | { error: string }

  interface PaginatedMeta {
    hasNextPage: false,
    hasPrevPage: false,
    endCursor?: string,
    startCursor?: string
  }
}

export { }