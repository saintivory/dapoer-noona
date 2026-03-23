"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import ProductCard from "@/components/ProductCard"
import Header from "@/components/Header"
import Toast from "@/components/Toast"
import CartDrawer from "@/components/CartDrawer"
import { Product } from "@/types/product" // ✅ pakai ini aja, jangan bikin ulang

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOption, setSortOption] = useState("default")
  const [toastMessage, setToastMessage] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [cartOpen, setCartOpen] = useState(false) // ✅ FIX penting

  const itemsPerPage = 25

  // 🔥 FETCH SUPABASE
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)

    const { data } = await supabase
      .from("products")
      .select("*, categories(name)")
      .order("created_at", { ascending: false })

    setProducts(data || [])
    setLoading(false)
  }

  // 🔥 CATEGORY DARI DB
  const categories = [
    "All",
    ...new Set(products.map((p) => p.categories?.name || "-")),
  ]

  // 🔥 FILTER
  let filteredProducts = products.filter((p) => {
    const matchSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())

    const matchCategory =
      selectedCategory === "All"
        ? true
        : p.categories?.name === selectedCategory

    return matchSearch && matchCategory
  })

  // 🔥 SORT
  if (sortOption === "mahal")
    filteredProducts.sort((a, b) => b.price - a.price)
  else if (sortOption === "murah")
    filteredProducts.sort((a, b) => a.price - b.price)
  else if (sortOption === "a-z")
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name))
  else if (sortOption === "z-a")
    filteredProducts.sort((a, b) => b.name.localeCompare(a.name))

  // 🔥 PAGINATION
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  // 🔥 ADD TO CART
  const handleAddToCart = (product: Product) => {
    window.dispatchEvent(
      new CustomEvent("addToCart", { detail: product.id })
    )

    setToastMessage(`"${product.name}" ditambahkan ke keranjang`)
    setCartOpen(true) // ✅ langsung buka drawer biar kerasa hidup
  }

  return (
    <main className="flex flex-col min-h-screen">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        logoSrc="/logo-noona.png"
      />

      <div className="p-4 max-w-7xl mx-auto flex-1">
        <h1 className="text-xl md:text-2xl font-bold mb-2">
          Selamat Datang di Dapoer Noona
        </h1>

        <p className="text-gray-500 mb-4">
          Silahkan pilih snack favorit kamu!
        </p>

        {/* FILTER */}
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-2">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat)
                  setCurrentPage(1)
                }}
                className={`px-3 py-1 text-sm rounded-full ${
                  selectedCategory === cat
                    ? "bg-black text-white"
                    : "bg-white shadow"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value)
              setCurrentPage(1)
            }}
            className="px-3 py-1 rounded-lg shadow"
          >
            <option value="default">Urutkan</option>
            <option value="mahal">Harga Tertinggi</option>
            <option value="murah">Harga Termurah</option>
            <option value="a-z">A-Z</option>
            <option value="z-a">Z-A</option>
          </select>
        </div>

        {/* GRID */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="bg-white h-40 rounded-xl animate-pulse shadow"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2 flex-wrap">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (num) => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`px-3 py-1 rounded ${
                    currentPage === num
                      ? "bg-black text-white"
                      : "bg-white shadow"
                  }`}
                >
                  {num}
                </button>
              )
            )}
          </div>
        )}
      </div>

      <footer className="shadow mt-6 p-4 text-center font-bold bg-white">
        © Dapoer Noona - 2026
      </footer>

      {/* ✅ FIX: sekarang bisa kebuka */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {toastMessage && <Toast message={toastMessage} />}
    </main>
  )
}