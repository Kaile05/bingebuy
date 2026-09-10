import { db} from "@/lib/db";
import { validateProductId, validateProductData } from "@/lib/validation";
import { handleError } from "@/lib/error";
import { 
  RowDataPacket,
  ResultSetHeader
 } from "mysql2";

export async function GET(
  request: Request,
  { params }:{ params: Promise<{ id: string }>}
) {
  const { id } = await params
  const productId = validateProductId(id)

  if (productId === null) {
    return Response.json(
      {
        success: false,
        message: "Product ID must be a positive integer"
      },
      {
        status: 400
      }
    )
  }

  try {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM products WHERE id=?",
      [productId]
    )

    if(rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Product not found"
        },
        {
          status: 404
        }
      )
    }

    return Response.json(
      {
        success: true,
        message: "Product fetched successfully!",
        data: rows[0]
      },
      {
        status: 200
      }
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
    return Response.json(
      {
        success: false,
        message: "Product ID must be a positive integer"
      },
      {
        status: 400
      }
    )
  }

  try {
    body = await request.json()
  } catch (error) {
    console.error (error)

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
  const product = validateProductData(data)

  if (product === null) {
    return Response.json(
      {
        success: false,
        message: "Invalid product data"
      },
      {
        status: 400
      }
    )
  }


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

 try {

    const [result] = await db.execute<ResultSetHeader> (
      "UPDATE products SET name = ?, price =? WHERE id = ?",
      [product.name, product.price, productId]
    )

    if(result.affectedRows === 0) {
      return Response.json(
        {
          success: false,
          message: "Product not found"
        },
        {
          status: 404
        }
      )
    }

    return Response.json(
      {
        success: true,
        message: "Product updated successfully!",
        data: {
          id: productId
        }
      },
      {
        status: 200
      }
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
    return Response.json(
      {
        success: false,
        message: "Product ID must be a positive integer"
      },
      {
        status: 400
      }
    )
  }

  try {

    body = await request.json()
    
  } catch (error) {
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

  if (data.price !== undefined &&
      (
        typeof data.price !== "number" 
        || data.price <= 0
      )
    ) {
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
  
    if (data.name !== undefined && 
      (
        typeof data.name !== "string" 
        || data.name.trim() === ""
      )
    ) {
      return Response.json(
        {
          success: false,
          message: "Product name must be a non-empty string"
        },
        {
          status: 400
        }
      )
    }
  
  try {

    const fields: string[] = []
    const values: (string | number)[] = []
  
    if (typeof data.name === "string") {
      fields.push("name = ?")
      values.push(data.name.trim())
    }
  
    if (typeof data.price === "number") {
      fields.push("price = ?")
      values.push(data.price)
    }
  
    if (fields.length === 0) {
      return Response.json(
        {
          success: false,
          message: "At least one field is required"
        },
        {
          status: 400
        }
      )
    }
    
    values.push(productId)
    const sql = `UPDATE products SET ${fields.join(", ")} WHERE id = ?`
    const [result] = await db.execute<ResultSetHeader> (
      sql,
      values
    )
  
    if (result.affectedRows === 0) {
      return Response.json(
        {
          success: false,
          message: "Product not found"
        },
        {
          status: 404
        }
      )
    }
  
    return Response.json(
      {
        success: true,
        message: "Product updated successfully!",
        data: {
          id: productId
        }
      },
      {
        status: 200
      }
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
    return Response.json(
      {
        success: false,
        message: "Product ID must be a positive integer"
      },
      {
        status: 400
      }
    )
  }

  try {

    const [result] = await db.execute<ResultSetHeader> (
      "DELETE FROM products WHERE id = ?",
      [productId]
    )

    if(result.affectedRows === 0) {
      return Response.json(
        {
          success: false,
          message: "Product not found"
        },
        {
          status: 404
        }
      )
    }

    return Response.json(
      {
        success: true,
        message: "Product deleted successfully!",
        data: {
          id: productId
        }
      },
      {
        status: 200
      }
    )
  } catch (error) {
    return handleError(
      error,
      "Failed to delete product"
    )
  }  
}