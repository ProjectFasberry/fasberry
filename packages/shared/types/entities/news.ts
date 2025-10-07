export type News = {
  id: number;
  title: string;
  created_at: string;
  description: string;
  imageUrl: string | null;
  views: number;
};

export type NewsPayload = {
  data: News[];
  meta: PaginatedMeta;
};