"use client"

import { useEffect, useState } from "react"
import CartDrawer from "./CartDrawer"

type HeaderProps = {
  searchQuery: string
  setSearchQuery: (value: string) => void
  logoSrc?: string // path/logo image
}

export default function Header({ searchQuery, setSearchQuery, logoSrc }: HeaderProps) {
  const [cartCount, setCartCount] = useState(0)
  const [openCart, setOpenCart] = useState(false)

  useEffect(() => {
    const updateCart = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]")
      setCartCount(cart.length)
    }
    updateCart()
    window.addEventListener("cartUpdated", updateCart)
    return () => window.removeEventListener("cartUpdated", updateCart)
  }, [])

  return (
    <>
      <header className="sticky top-0 bg-white z-50 shadow-md p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-b-md">
        
        {/* LOGO */}
        <div className="flex items-center">
          {logoSrc ? (
            <div className="w-52 h-15 relative">
              <img
                src={logoSrc}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="text-lg font-bold cursor-pointer">LOGO</div>
          )}
        </div>

        {/* SEARCH + CART */}
        <div className="flex items-center w-full md:w-auto gap-2">
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border rounded-lg px-3 py-1 w-full md:w-64 shadow-sm focus:outline-none focus:ring-1 focus:ring-pink-300"
          />

          <div
            onClick={() => setOpenCart(true)}
            className="flex items-center gap-2 relative cursor-pointer"
          >
            <div className="text-xl">🛒</div>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#FC8FA7] text-white text-xs px-1.5 rounded-full">
                {cartCount}
              </span>
            )}
            <span className="hidden md:block font-medium">Keranjang</span>
          </div>
        </div>
      </header>

      <CartDrawer open={openCart} onClose={() => setOpenCart(false)} />
    </>
  )
}