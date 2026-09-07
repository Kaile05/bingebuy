import { db } from "@/lib/db";
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
 try {
    const body = await request.json()

    const { id } = await params

    const [result] = await db.execute<ResultSetHeader> (
      "UPDATE products SET name = ?, price =? WHERE id = ?",
      [body.name, body.price, id]
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
  
  
  try {
    const { id } = await params
  
    const body = await request.json()
  
    if (body.price !== undefined &&
      (
        typeof body.price !== "number" || body.price <= 0
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
  
    if (body.name !== undefined && 
      (
        typeof body.name !== "string" || body.name.trim() === ""
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
  
    const fields = []
    const values = []
  
    if (body.name !== undefined) {
      fields.push("name = ?")
      values.push(body.name)
    }
  
    if (body.price !== undefined) {
      fields.push("price = ?")
      values.push(body.price)
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
        message: "Product deleted successfully!"
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