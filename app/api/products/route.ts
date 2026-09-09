import { db } from "@/lib/db";
import { 
  RowDataPacket, 
  ResultSetHeader
} from "mysql2";

import { 
  DatabaseProduct,
  CreateProductInput
 } from "@/types/product";

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

  let sql = "SELECT * FROM products"
  let countSql = "SELECT COUNT(*) AS total FROM products"

  const conditions = []
  const values = []

  if (category) {
    conditions.push("category = ?")
    values.push(category)
  }

  let minPriceNumber: number | undefined
  let maxPriceNumber: number | undefined

  if (minPrice) {
    minPriceNumber = Number(minPrice)

    if (Number.isNaN(minPriceNumber)) {
      return Response.json(
        {
          success: false,
          message: "minPrice must be a valid number"
        },
        {
          status:400
        }
      )
    }

    conditions.push("price >= ?")
    values.push(minPriceNumber)
  }

  if (maxPrice) {
    maxPriceNumber = Number(maxPrice)

    if (Number.isNaN(maxPriceNumber)) {
      return Response.json(
        {
          success: false,
          message: "maxPrice must be a valid number"
        },
        {
          status:400
        }
      )
    }
    conditions.push("price <= ?")
    values.push(maxPriceNumber)
  }

  if (search) {
    conditions.push("name LIKE ?")
    values.push(`%${search}%`)
  }

  if (
    minPriceNumber !== undefined &&
    maxPriceNumber !== undefined &&
    minPriceNumber > maxPriceNumber
  ) {
    return Response.json(
      {
        success: false,
        message: "minPrice cannot be greater than maxPrice"
      },
      {
        status: 400
      }
    )
  }


  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ")
  }

  if (conditions.length > 0) {
    countSql += " WHERE " + conditions.join(" AND ")
  }

  const allowedSorts = [
    "price_asc",
    "price_desc"
  ]

  if (sort && !allowedSorts.includes(sort)) {
    return Response.json(
      {
        success: false,
        message: "Invalid sort input"
      },
      {
        status: 400
      }
    )
  }

  if (sort === "price_asc") {
    sql += " ORDER BY price ASC"
  }

  if (sort === "price_desc") {
    sql += " ORDER BY price DESC"
  }

  if (
    !Number.isInteger(pageNumber) ||
    pageNumber < 1
  ) {
    return Response.json(
      {
        success: false,
        message: "Page must be a positive integer"
      },
      {
        status: 400
      }
    )
  }

  if (
    !Number.isInteger(limitNumber) ||
    limitNumber < 1 ||
    limitNumber > 100
  ) {
    return Response.json(
      {
        success: false,
        message: "Limit must be between 1 and 100"
      },
      {
        status: 400
      }
    )
  }


  try {
    const [countRows] = await db.query<RowDataPacket[]> (
      countSql,
      values
    )

    const totalProducts = Number(countRows[0].total)
    const totalPages = Math.ceil(totalProducts / limitNumber)

    const offset = (pageNumber - 1) * limitNumber

    sql += " LIMIT ? OFFSET ?"
    values.push(limitNumber, offset)

    const [rows] = await db.query<(DatabaseProduct & RowDataPacket)[]> (
      sql, values
    )

    return Response.json(
      {
        success: true,
        message: "Products fetched successfully!",
        data: rows,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          totalProducts,
          totalPages
        }
      },
      {
        status: 200
      }
      
    )
  } catch (error) {
    console.error(error)

    return Response.json(
      {
        success: false,
        message: "Failed to fetch product"
      },
      {
        status: 500
      }
    )
  }
}

export async function POST( request: Request) {
  let body: unknown
  try {

    body = await request.json()
      
  } catch (error) {
    console.error(error)

    return Response.json(
      {
        success: false,
        message: "Invalid request"
      },
      {
        status: 400
      }
    )
  }

  if (
    typeof body !== "object" || 
    body === null ||
    Array.isArray(body)
  ) {

    return Response.json(
      {
        success: false,
        message: "Request body must be a JSON object"
      },
      {
        status: 400
      }
    )
  }

  const data = body as Record<string, unknown>

  const allowedFields = ["name", "price"]

  const unexpectedFields = Object.keys(data).filter(
    field => !allowedFields.includes(field)
  )

  if (unexpectedFields.length > 0) {
    return Response.json(
      {
        success: false,
        message: "Request contains unexpected fields"
      },
      {
        status: 400
      }
    )
  }

  if (
    typeof data.price !== "number" || 
    data.price <=0) {

    return Response.json(
      {
        success: false,
        message: "Product price must be a number greater than 0"
      },
      {
        status: 400
      }
    )
  }

  if (
    typeof data.name !== "string" || 
    data.name.trim() === "") {
    return Response.json(
      {
        success: false,
        message: "Product name is required"
      },
      {
        status: 400
      }
    )
  }

  const productName = data.name.trim()

  const product: CreateProductInput = {
    name: productName,
    price: data.price
  }

  try {
    const [result] = await db.execute<ResultSetHeader> (
      "INSERT INTO products (name, price) VALUES (?, ?)",
      [product.name, product.price]
    )
  
    return Response.json(
      {
        success: true,
        message: "Product created successfully!",
        data: {
          id: result.insertId,
          name: product.name,
          price: product.price
        }
      },
      {
        status: 201
      }
    )
  } catch (error) {
    console.error(error)

    return Response.json(
      {
        success: false,
        message: "Failed to create product"
      },
      {
        status: 500
      }
    )
  }
}