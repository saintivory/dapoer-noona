"use client"

import { useEffect, useState, useCallback } from "react"
import { Product } from "@/types/product"

type CartItem = Product & { qty: number; category?: string }

type CartDrawerProps = {
  open: boolean
  onClose: () => void
  products: Product[]
}

export default function CartDrawer({ open, onClose, products }: CartDrawerProps) {
  const [cart, setCart] = useState<CartItem[]>([])

  // 🔹 Sync cart dari localStorage saat drawer dibuka
  useEffect(() => {
    if (open) {
      const saved = JSON.parse(localStorage.getItem("cart") || "[]")
      setCart(saved)
    }
  }, [open])

  // 🔹 Update qty / hapus item secara efisien
  const updateCart = useCallback((index: number, delta: number) => {
    setCart((prevCart) => {
      const newCart = [...prevCart]
      const currentQty = newCart[index].qty ?? 1
      const newQty = currentQty + delta
      if (newQty <= 0) return prevCart
      newCart[index] = { ...newCart[index], qty: newQty }
      localStorage.setItem("cart", JSON.stringify(newCart))
      return newCart
    })
  }, [])

  const removeItem = useCallback((index: number) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((_, i) => i !== index)
      localStorage.setItem("cart", JSON.stringify(newCart))
      return newCart
    })
  }, [])

  const total = cart.reduce((sum, item) => sum + item.price * (item.qty ?? 1), 0)

  // 🔹 Event listener untuk addToCart (functional update)
  useEffect(() => {
    const handleAdd = (e: CustomEvent<string>) => {
      const productId = e.detail
      const prod = products.find((p) => p.id === productId)
      if (!prod) return

      setCart((prevCart) => {
        const index = prevCart.findIndex((p) => p.id === prod.id)
        let newCart: CartItem[]
        if (index >= 0) {
          newCart = [...prevCart]
          newCart[index] = { ...newCart[index], qty: (newCart[index].qty ?? 1) + 1 }
        } else {
          newCart = [...prevCart, { ...prod, qty: 1, category: prod.categories?.name }]
        }
        localStorage.setItem("cart", JSON.stringify(newCart))
        return newCart
      })
    }

    window.addEventListener("addToCart", handleAdd as EventListener)
    return () => window.removeEventListener("addToCart", handleAdd as EventListener)
  }, [products])

  const checkout = () => {
    if (!cart.length) return
    const message = cart
      .map(
        (item) =>
          `• ${item.name} (${item.qty ?? 1} Pcs) - Rp${(
            item.price * (item.qty ?? 1)
          ).toLocaleString("id-ID")}`
      )
      .join("\n")

    const text = `Assalamu'alaikum, *Admin Dapoer Noona*,\n\nSaya ingin memesan:\n\n${message}\n\n*Total:* Rp${total.toLocaleString(
      "id-ID"
    )}\n\nNama:\nAlamat:\nTanggal kirim:\nCatatan:\n\nTerimakasih yaa..`

    const phone = "6285642327934"
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank")
  }

  return (
    <>
      {open && <div onClick={onClose} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />}

      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* HEADER */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-bold text-lg">Keranjang</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* CONTENT */}
        <div className="p-4 overflow-y-auto h-[calc(100%-180px)]">
          {!cart.length ? (
            <p className="text-gray-500">Keranjang kosong</p>
          ) : (
            cart.map((item, i) => (
              <div key={item.id} className="flex items-center gap-3 border-b pb-3 mb-3">
                <img src={item.image || "/no-image.png"} alt={item.name} className="w-16 h-16 object-cover rounded" />
                <div className="flex-1 flex flex-col">
                  <p className="font-bold text-sm line-clamp-2">{item.name}</p>
                  <p className="text-gray-500 text-xs">{item.category || item.categories?.name}</p>
                  <p className="font-bold text-sm mt-1">
                    Rp{(item.price * (item.qty ?? 1)).toLocaleString("id-ID")}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => updateCart(i, -1)} className="px-2 py-1 shadow rounded text-sm">-</button>
                    <span className="text-sm">{item.qty ?? 1}</span>
                    <button onClick={() => updateCart(i, 1)} className="px-2 py-1 shadow rounded text-sm">+</button>
                    <button onClick={() => removeItem(i)} className="ml-auto text-red-500 text-sm">Hapus</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t">
          <p className="font-bold mb-2 text-lg">Total: Rp{total.toLocaleString("id-ID")}</p>
          <button
            onClick={checkout}
            className="w-full py-3 text-white rounded-lg bg-gradient-to-r from-[#FC8FA7] to-[#F76C8F] shadow hover:scale-[1.02] transition"
          >
            Checkout via WhatsApp
          </button>
        </div>
      </div>
    </>
  )
}