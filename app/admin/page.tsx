"use client"

import { useEffect, useState } from "react"

type Product = {
  id: string
  name: string
  price: number
  category: string
  image: string
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [usernameInput, setUsernameInput] = useState("")
  const [passwordInput, setPasswordInput] = useState("")

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [editIndex, setEditIndex] = useState<number | null>(null)

  const [form, setForm] = useState({
    id: "",
    name: "",
    price: "",
    category: "",
    image: "",
  })

  const ADMIN_USERNAME = "admin"
  const ADMIN_PASSWORD = "noona2026"

  useEffect(() => {
    const productData: Product[] = JSON.parse(localStorage.getItem("products") || "[]")
    setProducts(productData)

    let categoryData: string[] = JSON.parse(localStorage.getItem("categories") || "[]")

    if (categoryData.length === 0 && productData.length > 0) {
      const autoCategories: string[] = [
        ...new Set(
          productData
            .map((p) => p.category)
            .filter((c): c is string => typeof c === "string") // pastikan string
        )
      ]
      setCategories(autoCategories)
      localStorage.setItem("categories", JSON.stringify(autoCategories))
    } else {
      setCategories(categoryData)
    }
  }, [])

  const login = () => {
    if (usernameInput === ADMIN_USERNAME && passwordInput === ADMIN_PASSWORD) {
      setIsLoggedIn(true)
    } else {
      alert("Username atau password salah!")
    }
  }

  const saveProducts = (data: Product[]) => {
    setProducts(data)
    localStorage.setItem("products", JSON.stringify(data))
  }

  const handleSubmit = () => {
    if (!form.name || !form.price || !form.category) {
      alert("Isi semua field!")
      return
    }

    let updated = [...products]

    if (editIndex !== null) {
      updated[editIndex] = {
        ...form,
        price: Number(form.price),
        id: form.id || `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      }
    } else {
      updated.push({
        ...form,
        price: Number(form.price),
        id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      })
    }

    saveProducts(updated)

    setForm({
      id: "",
      name: "",
      price: "",
      category: "",
      image: "",
    })
    setEditIndex(null)
  }

  const deleteProduct = (index: number) => {
    const updated = products.filter((_, i) => i !== index)
    saveProducts(updated)
  }

  const addCategory = () => {
    if (!newCategory) return

    if (categories.includes(newCategory)) {
      alert("Kategori sudah ada!")
      return
    }

    const updated = [...categories, newCategory]
    setCategories(updated)
    localStorage.setItem("categories", JSON.stringify(updated))
    setNewCategory("")
  }

  // ---------- RENDER ----------
  if (!isLoggedIn) {
    return (
      <div className="p-6 max-w-sm mx-auto mt-20 shadow-md rounded bg-white">
        <h1 className="text-xl font-bold mb-4 text-center">Login Admin</h1>
        <input
          placeholder="Username"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
          className="border p-2 w-full rounded mb-3"
        />
        <input
          placeholder="Password"
          type="password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          className="border p-2 w-full rounded mb-3"
        />
        <button
          onClick={login}
          className="w-full py-2 text-white rounded bg-[#FC8FA7]"
        >
          Login
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Admin Produk</h1>

      {/* FORM */}
      <div className="mb-6 space-y-3">
        <input
          placeholder="Nama Produk"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 w-full rounded"
        />
        <input
          placeholder="Harga"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="border p-2 w-full rounded"
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="border p-2 w-full rounded"
        >
          <option value="">Pilih Kategori</option>
          {categories.map((cat, i) => (
            <option key={i} value={cat}>{cat}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <input
            placeholder="Kategori baru"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="border p-2 w-full rounded"
          />
          <button
            onClick={addCategory}
            className="px-4 bg-black text-white rounded"
          >+</button>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (!file) return
            const reader = new FileReader()
            reader.onloadend = () => {
              setForm({ ...form, image: reader.result as string })
            }
            reader.readAsDataURL(file)
          }}
          className="border p-2 w-full rounded"
        />
        {form.image && (
          <img
            src={form.image}
            className="w-full h-40 object-cover rounded"
          />
        )}
        <button
          onClick={handleSubmit}
          className="w-full py-2 text-white rounded bg-[#FC8FA7]"
        >
          {editIndex !== null ? "Update Produk" : "Tambah Produk"}
        </button>
      </div>

      {/* LIST PRODUK */}
      {products.map((p, i) => (
        <div key={i} className="flex justify-between items-center border-b py-3">
          <div className="flex items-center gap-3">
            {p.image && (
              <img src={p.image} className="w-14 h-14 object-cover rounded" />
            )}
            <div>
              <p className="font-medium">{p.name}</p>
              <p className="text-sm text-gray-500">
                Rp{p.price.toLocaleString("id-ID")} • {p.category}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => {
                setForm(p)
                setEditIndex(i)
              }}
              className="text-blue-500 text-sm mr-3"
            >
              Edit
            </button>
            <button
              onClick={() => deleteProduct(i)}
              className="text-red-500 text-sm"
            >
              Hapus
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}