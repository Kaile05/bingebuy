import Image from "next/image";
import { ProductResponse } from "@/types/product";

export default async function Home() {
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products`)
  const data: ProductResponse = await response.json()
  console.log(data)
  return (
    <main>
      {data.data.products.map(product => (
        <div>
          <h1>{product.name}</h1>
          <h2>₱{product.price}</h2>
        </div>
      ))}
    </main>
  );
}
