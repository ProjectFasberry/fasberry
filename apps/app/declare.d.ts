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

  
  interface ViteTypeOptions {
    // By adding this line, you can make the type of ImportMetaEnv strict
    // to disallow unknown keys.
    // strictImportMetaEnv: unknown
  }

  interface ImportMetaEnv {
    readonly VITE_APP_HOST: string;
    readonly VITE_APP_PORT: string;
    readonly VITE_API_URL: string;
    readonly VITE_LANDING_URL: string;
    readonly VITE_MAIN_DOMAIN: string;
    readonly VITE_STATUS_URL: string;
    readonly VITE_APP_URL: string;
    readonly VITE_VOLUME_URL: string;
    readonly VITE_CAP_URL: string;
    readonly VITE_CAP_SITE_KEY: string;
    readonly VITE_APAY_TAG: string;
    readonly VITE_POF_IS_ACTIVE: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

export { }