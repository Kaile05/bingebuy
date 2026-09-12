import { db } from "@/lib/db"
import {  ResultSetHeader } from "mysql2"
import { getProducts } from "@/lib/product"
import { successResponse, errorResponse } from "@/lib/response"
import { hasUnexpectedFields, PRODUCT_FIELDS, validateProductData } from "@/lib/validation"
import { handleError } from "@/lib/error"

export async function GET( request: Request ) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const minPrice = searchParams.get("minPrice")
  const maxPrice = searchParams.get("maxPrice")
  const sort = searchParams.get("sort")
  const page = searchParams.get("page") ?? "1"
  const limit = searchParams.get("limit") ?? "10"
  const search = searchParams.get("search")

  const pageNumber = Number(page)
  const limitNumber = Number(limit)

  let minPriceNumber: number | undefined
  let maxPriceNumber: number | undefined

  if (minPrice !== null) {
    minPriceNumber = Number(minPrice)
  }

  if (maxPrice !== null) {
    maxPriceNumber = Number(maxPrice)
  }

  if (
    minPriceNumber !== undefined &&
    Number.isNaN(minPriceNumber)
  ) {
    return errorResponse (
      "minPrice must be a valid number",
      400
    )
  }

  if (
    maxPriceNumber !== undefined &&
    Number.isNaN(maxPriceNumber)
  ) {
    return errorResponse (
      "maxPrice must be a valid number",
      400
    )
  }

  if (
    minPriceNumber !== undefined &&
    maxPriceNumber !== undefined &&
    minPriceNumber > maxPriceNumber
  ) {
    return errorResponse(
      "minPrice cannot be greater than maxPrice",
      400
    )
  }

  const allowedSorts = [
    "price_asc",
    "price_desc"
  ]

  if (sort && !allowedSorts.includes(sort)) {
    return errorResponse(
      "Invalid sort input",
      400
    )
  }

  if (
    !Number.isInteger(pageNumber) ||
    pageNumber < 1
  ) {
    return errorResponse(
      "Page must be a positive integer",
      400
    )
  }

  if (
    !Number.isInteger(limitNumber) ||
    limitNumber < 1 ||
    limitNumber > 100
  ) {
    return errorResponse(
      "Limit must be between 1 and 100",
      400
    )
  }

  try {

    const result = await getProducts({
      category: category ?? undefined,
      minPrice: minPriceNumber,
      maxPrice: maxPriceNumber,
      search: search ?? undefined,
      sort: sort ?? undefined,
      page: pageNumber,
      limit: limitNumber
    })
  
    return successResponse(
      "Products fetched successfully!",
      {
        products: result.products,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          totalProducts: result.totalProducts,
          totalPages: result.totalPages
        }
      }
    )
  } catch (error) {
    console.error(error)

    return handleError(
      error,
      "Failed to fetch product"
    )
  }
}

export async function POST( request: Request) {
  let body: unknown
  try {

    body = await request.json()
      
  } catch (error) {
    console.error(error)

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
    const [result] = await db.execute<ResultSetHeader> (
      "INSERT INTO products (name, price) VALUES (?, ?)",
      [product.name, product.price]
    )
  
    return successResponse(
      "Product created successfully!",
      {
        id: result.insertId,
        name: product.name,
        price: product.price
      },
      201
    )

  } catch (error) {
    console.error(error)

    return handleError(
      error,
      "Failed to create product"
    )
  }
}