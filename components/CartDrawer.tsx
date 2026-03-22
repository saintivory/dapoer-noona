"use client"

import { useEffect, useState } from "react"

type Product = {
  id: string
  name: string
  price: number
  category: string
  image: string
  qty?: number
}

export default function CartDrawer({ open, onClose }: any) {
  const [cart, setCart] = useState<Product[]>([])

  useEffect(() => {
    const updateCart = () => {
      const data = JSON.parse(localStorage.getItem("cart") || "[]")
      setCart(data)
    }

    updateCart()
    window.addEventListener("cartUpdated", updateCart)
    return () => window.removeEventListener("cartUpdated", updateCart)
  }, [])

  const updateCartStorage = (newCart: Product[]) => {
    setCart(newCart)
    localStorage.setItem("cart", JSON.stringify(newCart))
    window.dispatchEvent(new Event("cartUpdated"))
  }

  const increaseQty = (index: number) => {
    const newCart = [...cart]
    newCart[index].qty = (newCart[index].qty || 1) + 1
    updateCartStorage(newCart)
  }

  const decreaseQty = (index: number) => {
    const newCart = [...cart]
    if ((newCart[index].qty || 1) > 1) {
      newCart[index].qty -= 1
      updateCartStorage(newCart)
    }
  }

  const removeItem = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index)
    updateCartStorage(newCart)
  }

  const addToCart = (product: Product) => {
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]") as Product[]

    // Cek apakah produk sudah ada di cart
    const index = existingCart.findIndex((p) => p.id === product.id)
    if (index >= 0) {
      existingCart[index].qty = (existingCart[index].qty || 1) + 1
    } else {
      existingCart.push({ ...product, qty: 1 })
    }

    updateCartStorage(existingCart)
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * (item.qty || 1),
    0
  )

  const checkout = () => {
    const message = cart
      .map(
        (item) =>
          `• ${item.name} (${item.qty || 1} Pcs) - Rp${(
            item.price * (item.qty || 1)
          ).toLocaleString("id-ID")}`
      )
      .join("\n")

    const text = `Assalamu'alaikum, *Admin Dapur Noona*,\n\nSaya ingin memesan:\n\n${message}\n\n*Total:* Rp${total.toLocaleString(
      "id-ID"
    )}\n\nNama:\nAlamat:\nTanggal kirim:\nCatatan:\n\nTerimakasih yaa..`

    const phone = "6285642327934" // ganti nomor WA
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
                  src={item.image || "https://via.placeholder.com/80"}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />

                <div className="flex-1 flex flex-col">
                  <p className="font-bold text-sm line-clamp-2">{item.name}</p>
                  <p className="text-gray-500 text-xs">{item.category}</p>
                  <p className="font-bold text-sm mt-1">
                    Rp{(item.price * (item.qty || 1)).toLocaleString("id-ID")}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => decreaseQty(i)}
                      className="px-2 py-1 border rounded text-sm"
                    >
                      -
                    </button>
                    <span className="text-sm">{item.qty || 1}</span>
                    <button
                      onClick={() => increaseQty(i)}
                      className="px-2 py-1 border rounded text-sm"
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
          <p className="font-bold mb-2 text-lg">Total: Rp{total.toLocaleString("id-ID")}</p>
          <button
            onClick={checkout}
            className="w-full py-3 text-white rounded-lg bg-gradient-to-r from-[#FC8FA7] to-pink-400 font-medium"
          >
            Checkout via WhatsApp
          </button>
        </div>
      </div>
    </>
  )
}