"use client"

import { useState } from "react"

type Product = {
  id: string
  name: string
  price: number
  image: string | null
  category_id: string
  categories?: {
    name: string
  }
}

type Props = {
  product: Product
  onAddToCart: (product: Product) => void
}

export default function ProductCard({ product, onAddToCart }: Props) {
  const [imgError, setImgError] = useState(false)

  const imageSrc = product.image && !imgError ? product.image : "/no-image.png"

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
      <div className="w-full aspect-[4/3] bg-gray-100">
        <img
          src={imageSrc}
          alt={product.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-3 flex flex-col">
        <h2 className="text-base sm:text-lg font-bold line-clamp-2">{product.name}</h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          {product.categories?.name || "Tanpa kategori"}
        </p>
        <p className="text-sm sm:text-base font-bold mt-2">
          Rp {product.price.toLocaleString("id-ID")}
        </p>
        <button
          onClick={() => onAddToCart(product)}
          className="mt-3 w-full py-2 text-sm rounded-xl text-white bg-gradient-to-br from-[#FC8FA7] to-[#F76C8F] shadow-md hover:shadow-lg hover:-translate-y-0.5 transition"
        >
          + Keranjang
        </button>
      </div>
    </div>
  )
}