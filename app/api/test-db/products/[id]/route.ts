import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }:{ params: Promise<{ id: string }>}
) {
  try {
    const { id } = await params
    const [rows] = await db.query (
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