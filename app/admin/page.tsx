"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Toast from "@/components/Toast"

type Category = { id: string; name: string }
type Product = { id: string; name: string; price: number; image: string; category_id: string; categories?: { name: string } }

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [usernameInput, setUsernameInput] = useState("")
  const [passwordInput, setPasswordInput] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingFetch, setLoadingFetch] = useState(true)
  const [toast, setToast] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [form, setForm] = useState({ id: "", name: "", price: "", category: "", image: "", oldImage: "" })
  const [newCategory, setNewCategory] = useState("")
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null)
  const [editCategoryName, setEditCategoryName] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 5

  const ADMIN_USERNAME = "admin"
  const ADMIN_PASSWORD = "noona2026"

  // LOGIN
  useEffect(() => { if (localStorage.getItem("admin_login") === "true") setIsLoggedIn(true) }, [])
  const login = () => {
    if (usernameInput === ADMIN_USERNAME && passwordInput === ADMIN_PASSWORD) {
      setIsLoggedIn(true)
      localStorage.setItem("admin_login", "true")
    } else setToast("Username / Password salah")
  }

  // FETCH DATA
  useEffect(() => {
    if (isLoggedIn) { fetchProducts(); fetchCategories() }
  }, [isLoggedIn])

  const fetchProducts = async () => {
    setLoadingFetch(true)
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(name)")
      .order("created_at", { ascending: false })
    if (error) console.error(error)
    else setProducts(data || [])
    setLoadingFetch(false)
  }

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*")
    if (error) console.error(error)
    else setCategories(data || [])
  }

  // UPLOAD IMAGE
  const uploadImage = async (file: File) => {
    const fileName = `${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from("product-images").upload(fileName, file)
    if (error) { console.error(error); setToast("Gagal upload image"); return null }
    const { data } = supabase.storage.from("product-images").getPublicUrl(fileName)
    return data.publicUrl
  }

  const handleImage = async (file: File) => {
    setLoading(true)
    const url = await uploadImage(file)
    if (url) setForm({ ...form, image: url })
    setLoading(false)
  }

  // TAMBAH / EDIT PRODUK
  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.category) { setToast("Isi semua field!"); return }
    setLoading(true)
    try {
      if (form.id) {
        const { error } = await supabase
          .from("products")
          .update({ name: form.name, price: Number(form.price), category_id: form.category, image: form.image })
          .eq("id", form.id)
        if (error) throw error
        setToast("Produk diupdate")
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert([{ name: form.name, price: Number(form.price), category_id: form.category, image: form.image }])
          .select()
        if (error) throw error
        setToast("Produk ditambahkan")
      }
    } catch (err) { console.error(err); setToast("Gagal menambahkan produk") }
    setForm({ id: "", name: "", price: "", category: "", image: "", oldImage: "" })
    fetchProducts()
    setLoading(false)
  }

  // TAMBAH KATEGORI
  const addCategory = async () => {
    if (!newCategory.trim()) { setToast("Nama kategori tidak boleh kosong"); return }
    try {
      const { data, error } = await supabase
        .from("categories")
        .insert([{ name: newCategory }])
        .select()
      if (error) throw error
      if (data && data[0]) {
        setCategories([...categories, data[0]])
        setForm({ ...form, category: data[0].id })
        setNewCategory("")
        setToast("Kategori berhasil ditambahkan")
      }
    } catch (err) { console.error(err); setToast("Gagal menambahkan kategori") }
  }

  // EDIT / HAPUS KATEGORI
  const updateCategory = async () => {
    if (!editCategoryId || !editCategoryName.trim()) { setToast("Nama kategori tidak boleh kosong"); return }
    try {
      const { error } = await supabase
        .from("categories")
        .update({ name: editCategoryName })
        .eq("id", editCategoryId)
      if (error) throw error
      setCategories(categories.map(c => c.id === editCategoryId ? { ...c, name: editCategoryName } : c))
      setEditCategoryId(null)
      setEditCategoryName("")
      setToast("Kategori diupdate")
    } catch (err) { console.error(err); setToast("Gagal update kategori") }
  }

  const deleteCategory = async (id: string) => {
    if (!confirm("Yakin hapus kategori?")) return
    try { const { error } = await supabase.from("categories").delete().eq("id", id); if (error) throw error } 
    catch (err) { console.error(err); setToast("Gagal hapus kategori") }
    setCategories(categories.filter(c => c.id !== id))
    setToast("Kategori dihapus")
  }

  // HAPUS PRODUK
  const deleteProduct = async (p: Product) => {
    if (!confirm("Yakin hapus produk?")) return
    const { error } = await supabase.from("products").delete().eq("id", p.id)
    if (error) console.error(error)
    else setToast("Produk dihapus")
    fetchProducts()
  }

  const bulkDelete = async () => {
    if (selected.length === 0) return
    if (!confirm("Hapus semua produk terpilih?")) return
    for (const id of selected) await supabase.from("products").delete().eq("id", id)
    setSelected([])
    setToast("Bulk delete berhasil")
    fetchProducts()
  }

  // PAGINATION + SEARCH
  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  // UI LOGIN
  if (!isLoggedIn) return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black">
      <div className="p-6 w-full max-w-sm shadow-md rounded-2xl space-y-3">
        <h1 className="text-xl font-bold text-center">Login Admin</h1>
        <input placeholder="Username" value={usernameInput} onChange={e => setUsernameInput(e.target.value)} className="w-full p-2 rounded-lg shadow-sm focus:outline-none"/>
        <input type="password" placeholder="Password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} className="w-full p-2 rounded-lg shadow-sm focus:outline-none"/>
        <button onClick={login} className="w-full bg-gradient-to-br from-[#FC8FA7] to-[#F76C8F] text-white py-2 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition">Login</button>
        {toast && <Toast message={toast}/>}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-xl font-bold">Admin Produk</h1>

        {/* FORM TAMBAH / EDIT PRODUK */}
        <div className="bg-white shadow-md rounded-2xl p-4 space-y-3">
          <h2 className="font-semibold">{form.id ? "Edit Produk" : "Tambah Produk"}</h2>
          <input placeholder="Nama produk" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full p-2 rounded-lg shadow-sm focus:outline-none"/>
          <input type="number" placeholder="Harga" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full p-2 rounded-lg shadow-sm focus:outline-none"/>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full p-2 rounded-lg shadow-sm focus:outline-none">
            <option value="">Pilih kategori</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <div className="flex gap-2 mt-2">
            <input placeholder="Tambah kategori baru" value={newCategory} onChange={e => setNewCategory(e.target.value)} className="flex-1 p-2 rounded-lg shadow-sm focus:outline-none"/>
            <button onClick={addCategory} className="bg-gradient-to-br from-[#FC8FA7] to-[#F76C8F] text-white px-4 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition">Tambah</button>
          </div>

          <input type="file" onChange={e => { if (e.target.files?.[0]) handleImage(e.target.files[0]) }} />
          {loading && <p className="text-sm text-gray-400">Uploading...</p>}
          {form.image && <img src={form.image} className="w-20 h-20 rounded-xl object-cover"/>}
          <button onClick={handleSubmit} className="w-full bg-gradient-to-br from-[#FC8FA7] to-[#F76C8F] text-white py-2 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition">{form.id ? "Update Produk" : "Tambah Produk"}</button>
        </div>

        {/* SEARCH + BULK DELETE */}
        <input placeholder="Cari produk..." value={search} onChange={e => setSearch(e.target.value)} className="w-full p-2 rounded-lg shadow-sm focus:outline-none"/>
        <button onClick={bulkDelete} className="w-full bg-red-500 text-white py-2 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition">Hapus Terpilih ({selected.length})</button>

        {/* LIST PRODUK */}
        {loadingFetch ? <p className="text-center text-gray-400">Loading...</p> :
          paginated.map(p => (
            <div key={p.id} className="flex justify-between items-center bg-white shadow-md rounded-xl p-3 hover:shadow-lg transition">
              <div className="flex gap-3 items-center">
                <input type="checkbox" checked={selected.includes(p.id)} onChange={e => { if (e.target.checked) setSelected([...selected, p.id]); else setSelected(selected.filter(id => id !== p.id)) }} />
                <img src={p.image} className="w-14 h-14 rounded object-cover"/>
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-gray-500">Rp{p.price.toLocaleString("id-ID")} • {p.categories?.name}</p>
                </div>
              </div>
              <div className="text-sm">
                <button onClick={() => setForm({ id: p.id, name: p.name, price: p.price.toString(), category: p.category_id, image: p.image, oldImage: p.image })} className="text-blue-500 mr-3 hover:underline">Edit</button>
                <button onClick={() => deleteProduct(p)} className="text-red-500 hover:underline">Hapus</button>
              </div>
            </div>
          ))
        }

        {/* PAGINATION */}
        <div className="flex gap-2 justify-center mt-3">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => setPage(i+1)} className={`px-3 py-1 rounded-lg shadow transition ${page===i+1 ? "bg-gradient-to-br from-[#FC8FA7] to-[#F76C8F] text-white" : "bg-white"}`}>{i+1}</button>
          ))}
        </div>

        {/* KATEGORI EDIT / HAPUS */}
        <div className="bg-white shadow-md rounded-2xl p-4 mt-4 space-y-2">
          <h2 className="font-semibold">Kelola Kategori</h2>
          {categories.map(c => (
            <div key={c.id} className="flex justify-between items-center shadow-sm p-2 rounded-lg">
              {editCategoryId === c.id ? (
                <>
                  <input value={editCategoryName} onChange={e => setEditCategoryName(e.target.value)} className="p-1 rounded shadow-sm"/>
                  <button onClick={updateCategory} className="text-green-500 text-sm">Simpan</button>
                </>
              ) : (
                <>
                  <span>{c.name}</span>
                  <div className="flex gap-2 text-sm">
                    <button onClick={() => { setEditCategoryId(c.id); setEditCategoryName(c.name) }} className="text-blue-500">Edit</button>
                    <button onClick={() => deleteCategory(c.id)} className="text-red-500">Hapus</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {toast && <Toast message={toast}/>}
      </div>
    </div>
  )
}