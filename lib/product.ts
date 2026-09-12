import { UpdateProductInput, DatabaseProduct } from "@/types/product"
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
  product: UpdateProductInput
) {

  const fields: string[] = []
  const values: (string | number)[] = []

  if (product.name !== undefined) {
      fields.push("name = ?")
      values.push(product.name)
    }

    if (product.price !== undefined) {
      fields.push("price = ?")
      values.push(product.price)
    }

  const queryValues = [...values, id]

  const sql = `UPDATE products SET ${fields.join(", ")} WHERE id = ?`
  const [result] = await db.execute<ResultSetHeader> (
      sql,
      queryValues
    )
  
  return result
}

type GetProductsOptions = {
  category?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  sort?: string
  page: number
  limit: number
}

export async function getProducts(
  options: GetProductsOptions) {

  const {
  category,
  minPrice,
  maxPrice,
  search,
  sort,
  page,
  limit
} = options
  
  let sql = "SELECT * FROM products"
  let countSql = "SELECT COUNT(*) AS total FROM products"

  const conditions = []
  const values = []

  if (category) {
    conditions.push("category = ?")
    values.push(category)
  }

  if (minPrice !== undefined) {
    conditions.push("price >= ?")
    values.push(minPrice)
  }

  if (maxPrice !== undefined) {
    conditions.push("price <= ?")
    values.push(maxPrice)
  }

  if (search) {
    conditions.push("name LIKE ?")
    values.push(`%${search}%`)
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ")
    countSql += " WHERE " + conditions.join(" AND ")
  }
  
  if (sort === "price_asc") {
    sql += " ORDER BY price ASC"
  }

  if (sort === "price_desc") {
    sql += " ORDER BY price DESC"
  }

  const [countRows] = await db.query<RowDataPacket[]> (
    countSql,
    values
    )
  
  const totalProducts = Number(countRows[0].total)
  const totalPages = Math.ceil(totalProducts / limit)
  
  const offset = (page - 1) * limit

  sql += " LIMIT ? OFFSET ?"

  const queryValues = [...values, limit, offset]

  const [rows] = await db.query<(DatabaseProduct & RowDataPacket)[]> (
    sql, 
    queryValues
  )

  return {
  products: rows,
  totalProducts,
  totalPages
  }
}  

