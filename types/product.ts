export type Product = {
  id: number
  title: string
  description: string
  price: number
  category: string
  stock: number
  rating: number
  thumbnail: string
}

export type DatabaseProduct = {
  id: number
  name: string
  description: string | null
  price: number
  category: string | null
  brand: string | null
  stock: number
  image: string | null
  rating: number | null
}

export type CreateProductInput = {
  name: string
  price: number
}

export type UpdateProductInput = {
  name?: string
  price?: number
}