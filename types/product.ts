export type Product = {
  id: string
  name: string
  price: number
  image: string | null
  category_id: string
  qty?: number
  categories?: {
    id?: string
    name: string
  }
}