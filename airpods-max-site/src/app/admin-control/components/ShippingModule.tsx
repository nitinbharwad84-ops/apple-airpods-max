"use client";
import { useEffect, useState } from "react";
import type { AdminSession } from "../page";
interface Props { admin: AdminSession; supabase: any; }

export default function ShippingModule({ admin, supabase }: Props) {
    const [shipments, setShipments] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ order_id: "", carrier: "Apple Shipping", tracking_number: "", estimated_delivery: "" });

    useEffect(() => { fetchData(); }, []);
    const fetchData = async () => {
        const [s, o] = await Promise.all([
            supabase.from("shipping_tracking").select("*, orders(order_number, shipping_name)").order("created_at", { ascending: false }),
            supabase.from("orders").select("id, order_number, shipping_name").eq("status", "Processing"),
        ]);
        setShipments(s.data || []); setOrders(o.data || []); setLoading(false);
    };

    const updateStatus = async (id: string, status: string) => {
        await supabase.from("shipping_tracking").update({ status, updated_by: admin.id, ...(status === "Delivered" ? { actual_delivery: new Date().toISOString().split("T")[0] } : {}) }).eq("id", id);
        fetchData();
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        await supabase.from("shipping_tracking").insert({ ...form, estimated_delivery: form.estimated_delivery || null, updated_by: admin.id });
        await supabase.from("orders").update({ status: "Shipped" }).eq("id", form.order_id);
        setShowModal(false); setForm({ order_id: "", carrier: "Apple Shipping", tracking_number: "", estimated_delivery: "" }); fetchData();
    };

    const statuses = ["Label Created", "Picked Up", "In Transit", "Out for Delivery", "Delivered", "Failed", "Returned"];
    const statusColor = (s: string) => s === "Delivered" ? "text-green-400 bg-green-500/20" : s === "In Transit" ? "text-blue-400 bg-blue-500/20" : s === "Failed" || s === "Returned" ? "text-red-400 bg-red-500/20" : "text-amber-400 bg-amber-500/20";

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Shipping & Logistics</h2>
                <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-colors">+ Create Shipment</button>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead><tr className="border-b border-white/10 text-white/40 text-xs uppercase">
                        <th className="px-5 py-3 text-left">Order</th><th className="px-5 py-3 text-left">Customer</th>
                        <th className="px-5 py-3 text-left">Carrier</th><th className="px-5 py-3 text-left">Tracking #</th>
                        <th className="px-5 py-3 text-left">Status</th><th className="px-5 py-3 text-left">Est. Delivery</th>
                        <th className="px-5 py-3 text-left">Actions</th>
                    </tr></thead>
                    <tbody className="divide-y divide-white/5">
                        {shipments.map(s => (
                            <tr key={s.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-5 py-3 font-mono text-xs">{s.orders?.order_number}</td>
                                <td className="px-5 py-3">{s.orders?.shipping_name}</td>
                                <td className="px-5 py-3 text-white/60">{s.carrier}</td>
                                <td className="px-5 py-3 font-mono text-xs">{s.tracking_number || "—"}</td>
                                <td className="px-5 py-3">
                                    <select value={s.status} onChange={e => updateStatus(s.id, e.target.value)} className={`${statusColor(s.status)} border-0 rounded-lg px-2 py-1 text-xs font-medium focus:outline-none`}>
                                        {statuses.map(st => <option key={st} value={st} className="bg-neutral-900 text-white">{st}</option>)}
                                    </select>
                                </td>
                                <td className="px-5 py-3 text-white/40 text-xs">{s.estimated_delivery || "—"}</td>
                                <td className="px-5 py-3 text-xs text-white/30">{s.actual_delivery ? `✅ ${s.actual_delivery}` : ""}</td>
                            </tr>
                        ))}
                        {shipments.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-white/30">No shipments</td></tr>}
                    </tbody>
                </table>
            </div>
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Create Shipment</h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <select required value={form.order_id} onChange={e => setForm({ ...form, order_id: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500">
                                <option value="" className="bg-neutral-900">Select Order</option>
                                {orders.map(o => <option key={o.id} value={o.id} className="bg-neutral-900">{o.order_number} — {o.shipping_name}</option>)}
                            </select>
                            <input value={form.carrier} onChange={e => setForm({ ...form, carrier: e.target.value })} placeholder="Carrier" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                            <input value={form.tracking_number} onChange={e => setForm({ ...form, tracking_number: e.target.value })} placeholder="Tracking Number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                            <input type="date" value={form.estimated_delivery} onChange={e => setForm({ ...form, estimated_delivery: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 rounded-xl py-3 text-sm transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 rounded-xl py-3 text-sm font-medium transition-colors">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
