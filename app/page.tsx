"use client"

import { useEffect, useState } from "react"
import ProductCard from "@/components/ProductCard"
import Header from "@/components/Header"
import Toast from "@/components/Toast"
import CartDrawer from "@/components/CartDrawer"

type Product = {
  id: string
  name: string
  price: number
  category: string
  image: string
  qty?: number
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOption, setSortOption] = useState("default")
  const [toastMessage, setToastMessage] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 25

  useEffect(() => {
    const stored = localStorage.getItem("products")
    if (stored) setProducts(JSON.parse(stored))
  }, [])

  const categories = ["All", ...new Set(products.map(p => p.category))]

  let filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedCategory === "All" ? true : p.category === selectedCategory)
  )

  if (sortOption === "mahal") filteredProducts.sort((a, b) => b.price - a.price)
  else if (sortOption === "murah") filteredProducts.sort((a, b) => a.price - b.price)
  else if (sortOption === "a-z") filteredProducts.sort((a, b) => a.name.localeCompare(b.name))
  else if (sortOption === "z-a") filteredProducts.sort((a, b) => b.name.localeCompare(a.name))

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage)

  const handleAddToCart = (product: Product) => {
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]") as Product[]
    const index = existingCart.findIndex((p) => p.id === product.id)
    if (index >= 0) {
      existingCart[index].qty = (existingCart[index].qty || 1) + 1
    } else {
      existingCart.push({ ...product, qty: 1 })
    }
    localStorage.setItem("cart", JSON.stringify(existingCart))
    window.dispatchEvent(new Event("cartUpdated"))
    setToastMessage(`Barang "${product.name}" ditambahkan ke keranjang`)
  }

  return (
    <main className="flex flex-col min-h-screen">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        logoSrc="/logo-noona.png"
      />

      <div className="p-4 max-w-7xl mx-auto flex-1">
        <h1 className="text-xl md:text-2xl font-bold mb-2">Selamat Datang di Dapoer Noona</h1>
        <p className="text-gray-500 mb-4">Silahkan pilih snack favorit kamu!</p>

        {/* KATEGORI + SORT */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-2">
          <div className="flex gap-2 overflow-x-auto flex-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setCurrentPage(1) }}
                className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                  selectedCategory === cat ? "bg-black text-white" : "bg-white shadow-sm"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="ml-0 md:ml-2 w-full md:w-auto">
            <select
              value={sortOption}
              onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1) }}
              className="border rounded-lg px-3 py-1 shadow-sm w-full md:w-auto"
            >
              <option value="default">Urutkan</option>
              <option value="mahal">Harga Tertinggi</option>
              <option value="murah">Harga Termurah</option>
              <option value="a-z">A-Z</option>
              <option value="z-a">Z-A</option>
            </select>
          </div>
        </div>

        {/* GRID PRODUK */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {paginatedProducts.map((product, index) => (
            <ProductCard
              key={index}
              product={product}
              onAddToCart={() => handleAddToCart(product)}
            />
          ))}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2 flex-wrap">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`px-3 py-1 rounded ${
                  currentPage === num ? "bg-black text-white" : "bg-white shadow-sm"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="shadow-sm mt-6 p-4 text-center font-bold rounded-t-md bg-white">
        © Dapoer Noona - 2026
      </footer>

      {/* TOAST */}
      {toastMessage && <Toast message={toastMessage} />}
    </main>
  )
}