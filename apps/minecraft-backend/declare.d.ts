declare module "*.txt"
declare module "*.db"

declare global {
  interface DatabaseConnection {
    host: string;
    database: string;
    user: string;
    password: string;
    port: number;
  };
}

export { }