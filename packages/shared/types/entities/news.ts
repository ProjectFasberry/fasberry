import { Json } from "../db/auth-database-types";

export type News = {
  id: number;
  title: string;
  created_at: string | Date;
  description: string;
  imageUrl: string;
  views: number;
  creator: string,
  content: Json
};

export type NewsPayload = {
  data: News[];
  meta: PaginatedMeta;
};