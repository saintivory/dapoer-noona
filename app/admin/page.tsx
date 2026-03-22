"use client"

import { useEffect, useState } from "react"

type Product = {
  id: string
  name: string
  price: number
  category: string
  image: string
}

type FormProduct = {
  id: string
  name: string
  price: string
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

  const [form, setForm] = useState<FormProduct>({
    id: "",
    name: "",
    price: "",
    category: "",
    image: "",
  })

  const ADMIN_USERNAME = "admin"
  const ADMIN_PASSWORD = "noona2026"

  // ---------- Load data ----------
  useEffect(() => {
    const productData = JSON.parse(localStorage.getItem("products") || "[]") as Product[]
    setProducts(productData)

    const categoryData = JSON.parse(localStorage.getItem("categories") || "[]") as string[]

    if (categoryData.length === 0 && productData.length > 0) {
      const autoCategories: string[] = [
        ...new Set(productData.map(p => p.category).filter((c): c is string => !!c))
      ]
      setCategories(autoCategories)
      localStorage.setItem("categories", JSON.stringify(autoCategories))
    } else {
      setCategories(categoryData)
    }
  }, [])

  // ---------- Login ----------
  const login = () => {
    if (usernameInput === ADMIN_USERNAME && passwordInput === ADMIN_PASSWORD) {
      setIsLoggedIn(true)
    } else {
      alert("Username atau password salah!")
    }
  }

  // ---------- Save products ----------
  const saveProducts = (data: Product[]) => {
    setProducts(data)
    localStorage.setItem("products", JSON.stringify(data))
  }

  // ---------- Handle add/edit ----------
  const handleSubmit = () => {
    if (!form.name || !form.price || !form.category) {
      alert("Isi semua field!")
      return
    }

    const priceNum = Number(form.price)
    if (isNaN(priceNum)) {
      alert("Harga harus angka!")
      return
    }

    const updated = [...products]

    if (editIndex !== null) {
      updated[editIndex] = {
        ...form,
        price: priceNum,
        id: form.id || `${Date.now()}-${Math.floor(Math.random() * 1000)}`
      }
    } else {
      updated.push({
        ...form,
        price: priceNum,
        id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`
      })
    }

    saveProducts(updated)

    setForm({ id: "", name: "", price: "", category: "", image: "" })
    setEditIndex(null)
  }

  // ---------- Delete ----------
  const deleteProduct = (index: number) => {
    const updated = products.filter((_, i) => i !== index)
    saveProducts(updated)
  }

  // ---------- Add category ----------
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

  // ---------- RENDER LOGIN ----------
  if (!isLoggedIn) {
    return (
      <div className="p-6 max-w-sm mx-auto mt-20 shadow-md rounded bg-white">
        <h1 className="text-xl font-bold mb-4 text-center">Login Admin</h1>
        <input
          placeholder="Username"
          value={usernameInput}
          onChange={e => setUsernameInput(e.target.value)}
          className="border p-2 w-full rounded mb-3"
        />
        <input
          placeholder="Password"
          type="password"
          value={passwordInput}
          onChange={e => setPasswordInput(e.target.value)}
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

  // ---------- RENDER ADMIN PAGE ----------
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Admin Produk</h1>

      {/* FORM */}
      <div className="mb-6 space-y-3">
        <input
          placeholder="Nama Produk"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="border p-2 w-full rounded"
        />
        <input
          placeholder="Harga"
          type="number"
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
          className="border p-2 w-full rounded"
        />
        <select
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
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
            onChange={e => setNewCategory(e.target.value)}
            className="border p-2 w-full rounded"
          />
          <button
            onClick={addCategory}
            className="px-4 bg-black text-white rounded"
          >
            +
          </button>
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={e => {
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
          <img src={form.image} className="w-full h-40 object-cover rounded" />
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
        <div key={p.id} className="flex justify-between items-center border-b py-3">
          <div className="flex items-center gap-3">
            {p.image && <img src={p.image} className="w-14 h-14 object-cover rounded" />}
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
                setForm({
                  id: p.id,
                  name: p.name,
                  price: p.price.toString(),
                  category: p.category,
                  image: p.image
                })
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