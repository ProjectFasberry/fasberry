export type BannerPayload = {
  id: number;
  title: string;
  description: string | null;
  href: {
    title: string;
    value: string;
  };
};

export type BannersPayload = {
  data: BannerPayload[];
  meta: PaginatedMeta;
};