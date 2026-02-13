"use client";
import { useEffect, useState } from "react";
import type { AdminSession } from "../page";

interface Props { admin: AdminSession; supabase: any; }

export default function ProductsModule({ admin, supabase }: Props) {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState({ name: "", value: "#000000", price: "549", image_url: "/products/airpods-max-select.png", filter_style: "none" });

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        const { data } = await supabase.from("products").select("*").order("created_at");
        setProducts(data || []);
        setLoading(false);
    };

    const openModal = (product?: any) => {
        if (product) {
            setEditing(product);
            setForm({ name: product.name, value: product.value, price: String(product.price), image_url: product.image_url, filter_style: product.filter_style || "none" });
        } else {
            setEditing(null);
            setForm({ name: "", value: "#000000", price: "549", image_url: "/products/airpods-max-select.png", filter_style: "none" });
        }
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...form, price: parseFloat(form.price) };
        if (editing) {
            await supabase.from("products").update(payload).eq("id", editing.id);
        } else {
            await supabase.from("products").insert(payload);
        }
        setShowModal(false);
        fetchProducts();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this product?")) return;
        await supabase.from("products").delete().eq("id", id);
        fetchProducts();
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Products ({products.length})</h2>
                <button onClick={() => openModal()} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-colors">+ Add Product</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {products.map(p => (
                    <div key={p.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all group">
                        <div className="w-full aspect-square rounded-xl mb-3 flex items-center justify-center" style={{ backgroundColor: p.value + "20" }}>
                            <div className="w-12 h-12 rounded-full" style={{ backgroundColor: p.value }} />
                        </div>
                        <h3 className="font-semibold text-sm">{p.name}</h3>
                        <p className="text-white/40 text-xs mt-1">${Number(p.price).toFixed(2)}</p>
                        <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openModal(p)} className="flex-1 text-xs bg-white/10 hover:bg-white/20 rounded-lg py-1.5 transition-colors">Edit</button>
                            <button onClick={() => handleDelete(p.id)} className="text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg px-3 py-1.5 transition-colors">✕</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">{editing ? "Edit" : "Add"} Product</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Color Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500" />
                            <div className="flex gap-3">
                                <input type="color" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} className="w-14 h-12 rounded-xl cursor-pointer bg-transparent border border-white/10" />
                                <input required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Price" type="number" step="0.01" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                            </div>
                            <input value={form.filter_style} onChange={e => setForm({ ...form, filter_style: e.target.value })} placeholder="CSS Filter Style" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500" />
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 rounded-xl py-3 text-sm transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 rounded-xl py-3 text-sm font-medium transition-colors">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
