declare global {
  declare module "*.jpg"
  declare module "*.png"
  declare module "*.gif"

  type WrappedResponse<T> = { data: T } | { error: string }

  type PaginatedMeta = {
    hasNextPage: false,
    hasPrevPage: false,
    endCursor?: string,
    startCursor?: string
  }

  type Maybe<T> = T | undefined
  type Nullable<T> = T | null
  type ReadonlyPartial<T> = Readonly<Partial<T>>
}

export { }