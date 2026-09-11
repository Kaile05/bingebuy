import { CreateProductInput, UpdateProductInput } from "@/types/product"

export const PRODUCT_FIELDS = [
  "name",
  "price"
]

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

export function validatePatchData (
  data: Record<string, unknown>
): UpdateProductInput | null {
  if (
    data.name !== undefined && 
    (
      typeof data.name !== "string" ||
      data.name.trim() === ""
    )
  ) {
    return null
  }

  if (
    data.price !== undefined && 
    (
      typeof data.price !== "number" ||
      data.price <= 0
    ) 
  ) {
    return null
  }
  
  if (
    data.name === undefined &&
    data.price === undefined
  ) {
    return null
  }

  return {
    ...(typeof data.name === "string"
      ? { name: data.name.trim()}
      : {}),
    
    ...(typeof data.price === "number"
      ? { price: data.price}
      : [])
  }
}

export function hasUnexpectedFields (
  data: Record<string, unknown>,
  allowedFields: string[]
): boolean {
  return Object.keys(data).some(
    field => !allowedFields.includes(field)
  )
}