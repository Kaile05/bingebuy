import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

async function seedProducts() {
  const { db } = await import("@/lib/db")

  const response = await fetch(
    "https://dummyjson.com/products?limit=0"
  )

  const data = await response.json()

  for (const product of data.products) {
    await db.execute(
      `INSERT INTO products
        (name, description, price, category, brand, stock, image, rating)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product.title,
        product.description,
        product.price,
        product.category,
        product.brand ?? null,
        product.stock,
        product.thumbnail,
        product.rating
      ]
    )
  }

  console.log("Products seeded successfully!")
}

seedProducts()