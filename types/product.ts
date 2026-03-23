export type Product = {
  id: string
  name: string
  price: number
  image: string | null
  category_id: string
  categories?: {
    id?: string
    name: string
  }
  qty?: number // ✅ tambah optional qty
}