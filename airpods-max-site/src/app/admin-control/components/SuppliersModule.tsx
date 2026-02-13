"use client";
import { useEffect, useState } from "react";
import type { AdminSession } from "../page";
interface Props { admin: AdminSession; supabase: any; }

export default function SuppliersModule({ admin, supabase }: Props) {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState({ name: "", contact_name: "", email: "", phone: "", address: "", payment_terms: "Net 30" });

    useEffect(() => { fetchSuppliers(); }, []);
    const fetchSuppliers = async () => { const { data } = await supabase.from("suppliers").select("*").order("name"); setSuppliers(data || []); setLoading(false); };

    const openModal = (s?: any) => {
        if (s) { setEditing(s); setForm({ name: s.name, contact_name: s.contact_name || "", email: s.email || "", phone: s.phone || "", address: s.address || "", payment_terms: s.payment_terms || "Net 30" }); }
        else { setEditing(null); setForm({ name: "", contact_name: "", email: "", phone: "", address: "", payment_terms: "Net 30" }); }
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editing) await supabase.from("suppliers").update(form).eq("id", editing.id);
        else await supabase.from("suppliers").insert(form);
        setShowModal(false); fetchSuppliers();
    };

    const toggleActive = async (s: any) => { await supabase.from("suppliers").update({ is_active: !s.is_active }).eq("id", s.id); fetchSuppliers(); };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Suppliers ({suppliers.length})</h2>
                <button onClick={() => openModal()} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-colors">+ Add Supplier</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suppliers.map(s => (
                    <div key={s.id} className={`bg-white/5 border rounded-2xl p-5 transition-all ${s.is_active ? "border-white/5 hover:border-white/10" : "border-white/5 opacity-50"}`}>
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="font-semibold">{s.name}</h3>
                                <p className="text-xs text-white/40">{s.contact_name || "No contact"}</p>
                            </div>
                            <button onClick={() => toggleActive(s)} className={`px-2 py-1 rounded-full text-xs ${s.is_active ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/40"}`}>
                                {s.is_active ? "Active" : "Inactive"}
                            </button>
                        </div>
                        {s.email && <p className="text-xs text-white/60 mb-1">📧 {s.email}</p>}
                        {s.phone && <p className="text-xs text-white/60 mb-1">📱 {s.phone}</p>}
                        <p className="text-xs text-white/30 mt-2">Terms: {s.payment_terms}</p>
                        <button onClick={() => openModal(s)} className="mt-3 text-xs text-blue-400 hover:text-blue-300">Edit</button>
                    </div>
                ))}
                {suppliers.length === 0 && <p className="text-white/30 col-span-full text-center py-12">No suppliers added</p>}
            </div>
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">{editing ? "Edit" : "Add"} Supplier</h3>
                        <form onSubmit={handleSave} className="space-y-3">
                            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Company Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                            <input value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} placeholder="Contact Person" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500" />
                            <div className="flex gap-3">
                                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" type="email" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500" />
                                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500" />
                            </div>
                            <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Address" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500" />
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
