import { CreateProductInput } from "@/types/product"

export function validateProductId (id: string): number | null {
  const productId = Number(id)
  if (
    !Number.isInteger(productId) ||
    productId < 1 
  ) {
    return null
  }

  return productId
} 

export function validateProductData (
  data: Record<string, unknown>
): CreateProductInput | null {
  if (
      typeof data.name !== "string" ||
      data.name.trim() === ""
    ) {
      return null
    }
  
  if (
      typeof data.price !== "number" ||
      data.price <= 0
    ) {
      return null
    }
  return {
    name: data.name.trim(),
    price: data.price
  }
}
