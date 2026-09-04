import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query("SELECT 1")

    return Response.json({
      message: "Database connected successfully!",
      result: rows
    })
  } catch (error) {
    console.error(error)

    return Response.json(
      {
        message: "Database connection failed"
      },
      {
        status: 500
      }
    )
  }
}