import { db } from "@/lib/db";
import { 
  RowDataPacket, 
  ResultSetHeader
} from "mysql2";

export async function GET() {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM products"
    )

    return Response.json(rows)
  } catch (error) {
    console.error(error)

    return Response.json(
      {
        message: "Failed to fetch products"
      },
      {
        status: 500
      }
    )
  }
}

export async function POST( request: Request) {
  const body = await request.json()

  if(!body.name || body.price === undefined) {
    return Response.json(
      {
        message: "Product name and price are required!"
      },
      {
        status: 400
      }
    )
  }

  if(typeof body.price !== "number" || body.price <=0) {
    return Response.json(
      {
        message: "Product price must be a number greater than 0"
      },
      {
        status: 400
      }
    )
  }

  if(typeof body.name !== "string" || body.name.trim() === "") {
    return Response.json(
      {
        message: "Product name is required"
      },
      {
        status: 400
      }
    )
  }

  const [result] = await db.execute<ResultSetHeader> (
    "INSERT INTO products (name, price) VALUES (?, ?)",
    [body.name, body.price]
  )

  return Response.json(
    {
      message: "Product created successfully!",
      id: result.insertId
    },
    {
      status: 201
    }
  )
}