
import { handleError } from "@/lib/error"
import { successResponse, errorResponse } from "@/lib/response"
import { 
  getProductById,
  updateProduct,
  updateProductFields,
  deleteProduct
} from "@/lib/product"
import { 
  validateProductId, 
  validateProductData, 
  validatePatchData,
  hasUnexpectedFields,
  PRODUCT_FIELDS
 } from "@/lib/validation"

export async function GET(
  request: Request,
  { params }:{ params: Promise<{ id: string }>}
) {
  const { id } = await params
  const productId = validateProductId(id)

  if (productId === null) {
    return errorResponse(
      "Product ID must be a positive integer",
      400
    )
  }

  try {
    
    const product = await getProductById(productId)

    if(product === null) {
      return errorResponse(
        "Product not found",
        404
      )
    }

    return successResponse(
      "Product fetched successfully!",
      product
    )

  } catch (error) {
    return handleError(
      error,
      "Failed to fetch product"
    )
  }
}

export async function PUT(
  request: Request,
  { params } : { params: Promise<{ id: string}> }
) {

  let body: unknown

  const { id } = await params
  const productId = validateProductId(id)

  if (productId === null) {
    return errorResponse(
      "Product ID must be a positive integer",
      400
    )
  }

  try {
    body = await request.json()
  } catch (error) {
    console.error (error)

    return errorResponse(
      "Invalid request",
      400
    )
  }

  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body)
  ) {
    return errorResponse(
      "Request body must be a JSON object",
      400
    )
  }

  const data = body as Record<string, unknown>

  if (hasUnexpectedFields(data, PRODUCT_FIELDS)) {
    return errorResponse(
      "Request contains unexpected fields",
      400
    )
  }

  const product = validateProductData(data)

  if (product === null) {
    return errorResponse(
      "Invalid product data",
      400
    )
  }

 try {

    const result = await updateProduct(
      productId,
      product.name,
      product.price
    )

    if(result.affectedRows === 0) {
      return errorResponse(
        "Product not found",
        404
      )
    }

    return successResponse(
      "Product updated successfully!",
      productId
    )

 } catch (error) {
  return handleError(
    error,
    "Failed to update product"
  )
 }
}

export async function PATCH(
  request: Request,
  { params } : { params: Promise<{ id: string}>}
) {

  let body: unknown
  const { id } = await params
  const productId = validateProductId(id)

  if (productId === null) {
    return errorResponse (
      "Product ID must be a positive integer",
      400
    )
  }

  try {

    body = await request.json()
    
  } catch (error) {
    return errorResponse (
      "Invalid request",
      400
    )
  }

  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body)
  ) {
    return errorResponse (
      "Request body must be a JSON object",
      400
    )
  }

  const data = body as Record<string, unknown>

  if (hasUnexpectedFields(data, PRODUCT_FIELDS)) {
    return errorResponse (
      "Request contains unexpected fields",
      400
    )
  }

  const product = validatePatchData(data)

  if (product === null) {
    return errorResponse(
      "Invalid product data",
      400
    )
  }

  try {

    const fields: string[] = []
    const values: (string | number)[] = []

    if (product.name !== undefined) {
      fields.push("name = ?")
      values.push(product.name)
    }

    if (product.price !== undefined) {
      fields.push("price = ?")
      values.push(product.price)
    }
    
    const result = await updateProductFields(
      productId,
      fields,
      values
    )
  
    if (result.affectedRows === 0) {
      return errorResponse(
        "Product not found",
        404
      )
    }
  
    return successResponse (
      "Product updated successfully!",
      productId
    )
    
  } catch (error) {
    return handleError(
      error,
      "Failed to update product"
    )
  }
}

export async function DELETE(
  request: Request,
  { params } : { params: Promise<{ id: string }>}
) {
  const { id } = await params
  const productId = validateProductId(id)

  if (productId === null) {
    return errorResponse (
      "Product ID must be a positive integer",
      400
    )
  }

  try {

    const result = await deleteProduct(productId)

    if(result.affectedRows === 0) {
      return errorResponse (
        "Product not found",
        404
      )
    }

    return successResponse (
      "Product deleted successfully!",
      productId
    )
  } catch (error) {
    return handleError(
      error,
      "Failed to delete product"
    )
  }  
}