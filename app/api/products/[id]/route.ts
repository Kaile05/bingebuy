import { db } from "@/lib/db";
import { CreateProductInput } from "@/types/product";
import { 
  RowDataPacket,
  ResultSetHeader
 } from "mysql2";

export async function GET(
  request: Request,
  { params }:{ params: Promise<{ id: string }>}
) {
  try {
    const { id } = await params
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM products WHERE id=?",
      [id]
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

export async function PUT(
  request: Request,
  { params } : { params: Promise<{ id: string}> }
) {

  let body: unknown

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

  if (
    typeof data.name !== "string" ||
    data.name.trim() === ""
  ) {
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

  if (
    typeof data.price !== "number" ||
    data.price <= 0
  ) {
    return Response.json(
      {
        success: false,
        message: "Product price must be greater than 0"
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

  const productName = data.name.trim()

  const product: CreateProductInput = {
    name: productName,
    price: data.price
  }

 try {
    
    const { id } = await params

    const [result] = await db.execute<ResultSetHeader> (
      "UPDATE products SET name = ?, price =? WHERE id = ?",
      [product.name, product.price, id]
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
          id
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
      message: "Failed to update product"
    },
    {
      status: 500
    }
  )
 }
}

export async function PATCH(
  request: Request,
  { params } : { params: Promise<{ id: string}>}
) {

  let body: unknown

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

    const { id } = await params

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
    
    values.push(id)
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
          id
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
        message: "Failed to update product"
      },
      {
        status: 500
      }
    )
  }
}

export async function DELETE(
  request: Request,
  { params } : { params: Promise<{ id: string }>}
) {
  try {
    const { id } = await params

    const [result] = await db.execute<ResultSetHeader> (
      "DELETE FROM products WHERE id = ?",
      [id]
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
          id
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
        message: "Failed to delete product"
      },
      {
        status: 500
      }
    )
  }  
}