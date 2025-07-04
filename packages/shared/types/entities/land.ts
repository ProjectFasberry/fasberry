export type Land = {
  members: {
    uuid: string;
    nickname: string;
    chunks: number;
  }[];
  area: any;
  name: string;
  balance: number;
  created_at: Date;
  title: string | null;
  type: string;
  ulid: string;
}