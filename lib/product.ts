import { db } from "./db"
import { RowDataPacket, ResultSetHeader } from "mysql2"

export async function getProductById(id: number) {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT * FROM products WHERE id = ?",
    [id]
  )

  return rows[0] ?? null
} 

export async function updateProduct(
  id: number,
  name: string,
  price: number
  ) {
  const [result] = await db.execute<ResultSetHeader> (
      "UPDATE products SET name = ?, price =? WHERE id = ?",
      [name, price, id]
    )

  return result
}

export async function deleteProduct(id: number) {
  const [result] = await db.execute<ResultSetHeader> (
      "DELETE FROM products WHERE id = ?",
      [id]
    )
  
  return result
}

export async function updateProductFields( 
  id: number,
  fields: string[],
  values: (string | number)[]
) {
  values.push(id)

  const sql = `UPDATE products SET ${fields.join(", ")} WHERE id = ?`
  const [result] = await db.execute<ResultSetHeader> (
      sql,
      values
    )
  
  return result
}