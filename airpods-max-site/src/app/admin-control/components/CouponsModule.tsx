"use client";
import { useEffect, useState } from "react";
import type { AdminSession } from "../page";
interface Props { admin: AdminSession; supabase: any; }

export default function CouponsModule({ admin, supabase }: Props) {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState({ code: "", discount_type: "percent", discount_value: "", expiry_date: "" });

    useEffect(() => { fetch(); }, []);
    const fetch = async () => { const { data } = await supabase.from("coupons").select("*").order("created_at"); setCoupons(data || []); setLoading(false); };

    const openModal = (c?: any) => {
        if (c) { setEditing(c); setForm({ code: c.code, discount_type: c.discount_type, discount_value: String(c.discount_value), expiry_date: c.expiry_date?.split("T")[0] || "" }); }
        else { setEditing(null); setForm({ code: "", discount_type: "percent", discount_value: "", expiry_date: "" }); }
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { code: form.code.toUpperCase(), discount_type: form.discount_type, discount_value: parseFloat(form.discount_value), expiry_date: form.expiry_date || null, is_active: true };
        if (editing) await supabase.from("coupons").update(payload).eq("id", editing.id);
        else await supabase.from("coupons").insert(payload);
        setShowModal(false); fetch();
    };

    const toggleStatus = async (c: any) => { await supabase.from("coupons").update({ is_active: !c.is_active }).eq("id", c.id); fetch(); };
    const handleDelete = async (id: string) => { if (confirm("Delete coupon?")) { await supabase.from("coupons").delete().eq("id", id); fetch(); } };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Coupons ({coupons.length})</h2>
                <button onClick={() => openModal()} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-colors">+ Add Coupon</button>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead><tr className="border-b border-white/10 text-white/40 text-xs uppercase">
                        <th className="px-5 py-3 text-left">Code</th><th className="px-5 py-3 text-left">Discount</th>
                        <th className="px-5 py-3 text-left">Uses</th><th className="px-5 py-3 text-left">Expiry</th>
                        <th className="px-5 py-3 text-left">Status</th><th className="px-5 py-3 text-left">Actions</th>
                    </tr></thead>
                    <tbody className="divide-y divide-white/5">
                        {coupons.map(c => (
                            <tr key={c.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-5 py-3 font-mono font-bold tracking-wider">{c.code}</td>
                                <td className="px-5 py-3">{c.discount_type === "percent" ? `${c.discount_value}%` : `$${c.discount_value}`}</td>
                                <td className="px-5 py-3 text-white/60">{c.usage_count}</td>
                                <td className="px-5 py-3 text-white/40 text-xs">{c.expiry_date ? new Date(c.expiry_date).toLocaleDateString() : "Never"}</td>
                                <td className="px-5 py-3">
                                    <button onClick={() => toggleStatus(c)} className={`px-2 py-1 rounded-full text-xs font-medium ${c.is_active ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/40"}`}>
                                        {c.is_active ? "Active" : "Inactive"}
                                    </button>
                                </td>
                                <td className="px-5 py-3 flex gap-2">
                                    <button onClick={() => openModal(c)} className="text-xs text-blue-400 hover:text-blue-300">Edit</button>
                                    <button onClick={() => handleDelete(c.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">{editing ? "Edit" : "Add"} Coupon</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="CODE" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white uppercase tracking-wider font-mono focus:outline-none focus:border-blue-500" />
                            <div className="flex gap-3">
                                <select value={form.discount_type} onChange={e => setForm({ ...form, discount_type: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500">
                                    <option value="percent" className="bg-neutral-900">Percent (%)</option>
                                    <option value="fixed" className="bg-neutral-900">Fixed ($)</option>
                                </select>
                                <input required type="number" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: e.target.value })} placeholder="Value" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                            </div>
                            <input type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
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
