"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Product = {
  id: string
  name: string
  price: number
  image: string | null
  category?: string
  categories?: {
    name: string
  }
  qty?: number
}

type CartDrawerProps = {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const [cart, setCart] = useState<Product[]>([])

  // 🔥 LOAD + SYNC CART
  useEffect(() => {
    const updateCart = () => {
      const data = JSON.parse(localStorage.getItem("cart") || "[]")
      setCart(data)
    }

    updateCart()

    const handleAdd = async (e: any) => {
      const id = e.detail

      const { data } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("id", id)
        .single()

      if (!data) return

      const existingCart = JSON.parse(localStorage.getItem("cart") || "[]")

      const index = existingCart.findIndex((p: any) => p.id === id)

      if (index >= 0) {
        existingCart[index].qty =
          (existingCart[index].qty ?? 1) + 1
      } else {
        existingCart.push({
          ...data,
          category: data.categories?.name,
          qty: 1,
        })
      }

      localStorage.setItem("cart", JSON.stringify(existingCart))
      updateCart()
    }

    window.addEventListener("addToCart", handleAdd)
    window.addEventListener("cartUpdated", updateCart)

    return () => {
      window.removeEventListener("addToCart", handleAdd)
      window.removeEventListener("cartUpdated", updateCart)
    }
  }, [])

  // 🔥 UPDATE LOCAL STORAGE
  const updateCartStorage = (newCart: Product[]) => {
    setCart(newCart)
    localStorage.setItem("cart", JSON.stringify(newCart))
    window.dispatchEvent(new Event("cartUpdated"))
  }

  const increaseQty = (index: number) => {
    const newCart = [...cart]
    const item = newCart[index]
    if (!item) return
    item.qty = (item.qty ?? 1) + 1
    updateCartStorage(newCart)
  }

  const decreaseQty = (index: number) => {
    const newCart = [...cart]
    const item = newCart[index]
    if (!item) return
    if ((item.qty ?? 1) > 1) {
      item.qty = (item.qty ?? 1) - 1
      updateCartStorage(newCart)
    }
  }

  const removeItem = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index)
    updateCartStorage(newCart)
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * (item.qty ?? 1),
    0
  )

  const checkout = () => {
    if (cart.length === 0) return

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
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
    window.open(url, "_blank")
  }

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        />
      )}

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
          {cart.length === 0 ? (
            <p className="text-gray-500">Keranjang kosong</p>
          ) : (
            cart.map((item, i) => (
              <div key={i} className="flex items-center gap-3 border-b pb-3 mb-3">
                <img
                  src={item.image || "/no-image.png"}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />

                <div className="flex-1 flex flex-col">
                  <p className="font-bold text-sm line-clamp-2">
                    {item.name}
                  </p>

                  <p className="text-gray-500 text-xs">
                    {item.category || item.categories?.name}
                  </p>

                  <p className="font-bold text-sm mt-1">
                    Rp{(item.price * (item.qty ?? 1)).toLocaleString("id-ID")}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => decreaseQty(i)}
                      className="px-2 py-1 shadow rounded text-sm"
                    >
                      -
                    </button>

                    <span className="text-sm">{item.qty ?? 1}</span>

                    <button
                      onClick={() => increaseQty(i)}
                      className="px-2 py-1 shadow rounded text-sm"
                    >
                      +
                    </button>

                    <button
                      onClick={() => removeItem(i)}
                      className="ml-auto text-red-500 text-sm"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t">
          <p className="font-bold mb-2 text-lg">
            Total: Rp{total.toLocaleString("id-ID")}
          </p>

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