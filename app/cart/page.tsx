"use client"

import { useEffect, useState } from "react"

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([])

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("cart") || "[]")
    setCart(data)
  }, [])

  const updateCartStorage = (newCart: any[]) => {
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
    }
    updateCartStorage(newCart)
  }

  const removeItem = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index)
    updateCartStorage(newCart)
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * (item.qty || 1),
    0
  )

  const checkout = () => {
    const message = cart
      .map(
        (item, i) =>
          `${i + 1}. ${item.name} x${item.qty || 1} - Rp${(
            item.price * (item.qty || 1)
          ).toLocaleString("id-ID")}`
      )
      .join("\n")

    const text = `Halo, saya ingin memesan:\n\n${message}\n\nTotal: Rp${total.toLocaleString(
      "id-ID"
    )}\n\nNama:\nAlamat:\nTanggal kirim:\nCatatan:`

    const phone = "6285156230441"

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
    window.open(url, "_blank")
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Keranjang</h1>

      {cart.length === 0 ? (
        <p>Keranjang kosong</p>
      ) : (
        <>
          {cart.map((item, i) => (
            <div key={i} className="flex justify-between items-center mb-4">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">
                  Rp{item.price.toLocaleString("id-ID")}
                </p>

                {/* Quantity */}
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => decreaseQty(i)}
                    className="px-2 border rounded"
                  >
                    -
                  </button>
                  <span>{item.qty || 1}</span>
                  <button
                    onClick={() => increaseQty(i)}
                    className="px-2 border rounded"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold">
                  Rp{(item.price * (item.qty || 1)).toLocaleString("id-ID")}
                </p>

                <button
                  onClick={() => removeItem(i)}
                  className="text-red-500 text-sm mt-1"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}

          <div className="mt-4 font-bold text-lg">
            Total: Rp{total.toLocaleString("id-ID")}
          </div>

          <button
            onClick={checkout}
            className="mt-4 w-full py-3 text-white rounded-lg bg-gradient-to-r from-[#FC8FA7] to-pink-400"
          >
            Checkout via WhatsApp
          </button>
        </>
      )}
    </div>
  )
}