"use client"

type Props = {
  product: {
    id: string
    name: string
    price: number
    category: string
    image: string
  }
  onAddToCart?: () => void
}

export default function ProductCard({ product, onAddToCart }: Props) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer">
      <div className="w-full aspect-[4/3] bg-gray-100">
        <img
          src={product.image || "https://via.placeholder.com/300"}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-3 flex flex-col">
        <h2 className="text-base sm:text-lg font-bold leading-tight line-clamp-2 min-h-[20px]">
          {product.name}
        </h2>

        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          {product.category}
        </p>

        <p className="text-sm sm:text-base font-bold mt-2">
          Rp {product.price.toLocaleString("id-ID")}
        </p>

        <button
          onClick={onAddToCart}
          className="mt-3 w-full py-2 text-sm rounded-lg text-white bg-gradient-to-r from-[#FC8FA7] to-pink-400 transition transform hover:scale-105"
        >
          + Keranjang
        </button>
      </div>
    </div>
  )
}