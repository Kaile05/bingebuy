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
          message: "Product not found"
        },
        {
          status: 404
        }
      )
    }

    return Response.json(rows[0])
  } catch (error) {
    console.error(error)

    return Response.json(
      {
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
          message: "Product not found"
        },
        {
          status: 404
        }
      )
    }

    return Response.json(
      {
        message: "Product updated successfully!",
        id
      }
    )
 } catch (error) {
  console.error(error)

  return Response.json(
    {
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
          message: "Product not found"
        },
        {
          status: 404
        }
      )
    }

    return Response.json(
      {
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
        message: "Failed to delete product"
      },
      {
        status: 500
      }
    )
  }  
}