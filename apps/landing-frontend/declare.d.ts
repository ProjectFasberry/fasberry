declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_MINECRAFT_SERVER_FASBERRY_PORT: number,
      NEXT_PUBLIC_MINECRAFT_SERVER_BISQUITE_PORT: number
      SECRET_TOKEN: string,
      NEXT_PUBLIC_SKIN_BACKEND_PORT: number
    }
  }
}