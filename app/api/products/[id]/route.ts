import { db } from "@/lib/db"
import { handleError } from "@/lib/error"
import { RowDataPacket, ResultSetHeader } from "mysql2"
import { successResponse, errorResponse } from "@/lib/response"
import { 
  validateProductId, 
  validateProductData, 
  validatePatchData,
  hasUnexpectedFields
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
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM products WHERE id=?",
      [productId]
    )

    if(rows.length === 0) {
      return errorResponse(
        "Product not found",
        404
      )
    }

    return successResponse(
      "Product fetched successfully!",
      rows[0],
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

  if (hasUnexpectedFields(data, ["name", "price"])) {
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

    const [result] = await db.execute<ResultSetHeader> (
      "UPDATE products SET name = ?, price =? WHERE id = ?",
      [product.name, product.price, productId]
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

  if (hasUnexpectedFields(data, ["name", "price"])) {
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
    
    values.push(productId)
    const sql = `UPDATE products SET ${fields.join(", ")} WHERE id = ?`
    const [result] = await db.execute<ResultSetHeader> (
      sql,
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

    const [result] = await db.execute<ResultSetHeader> (
      "DELETE FROM products WHERE id = ?",
      [productId]
    )

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