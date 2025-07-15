export type StoreItem = {
  id: string | number,
  title: string,
  description: string | null,
  imageUrl: string,
  origin: string,
  type: "donates" | string,
  price: number,
  details: {
    wallet: "real" | "charism" | "belkoin"
  }
}