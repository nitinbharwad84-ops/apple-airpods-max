"use client";
import { useEffect, useState } from "react";
import type { AdminSession } from "../page";
interface Props { admin: AdminSession; supabase: any; }

export default function PurchaseOrdersModule({ admin, supabase }: Props) {
    const [pos, setPos] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchData(); }, []);
    const fetchData = async () => {
        const [p, s] = await Promise.all([
            supabase.from("purchase_orders").select("*, suppliers(name), purchase_order_items(*)").order("created_at", { ascending: false }),
            supabase.from("suppliers").select("id, name").eq("is_active", true),
        ]);
        setPos(p.data || []); setSuppliers(s.data || []); setLoading(false);
    };

    const updateStatus = async (id: string, status: string) => {
        await supabase.from("purchase_orders").update({ status }).eq("id", id);
        fetchData();
    };

    const statuses = ["Draft", "Sent", "Confirmed", "Partially Received", "Received", "Cancelled"];
    const statusColor = (s: string) => s === "Received" ? "bg-green-500/20 text-green-400" : s === "Cancelled" ? "bg-red-500/20 text-red-400" : s === "Draft" ? "bg-white/10 text-white/40" : "bg-blue-500/20 text-blue-400";

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold">Purchase Orders ({pos.length})</h2>
            <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead><tr className="border-b border-white/10 text-white/40 text-xs uppercase">
                        <th className="px-5 py-3 text-left">PO #</th><th className="px-5 py-3 text-left">Supplier</th>
                        <th className="px-5 py-3 text-left">Items</th><th className="px-5 py-3 text-left">Total</th>
                        <th className="px-5 py-3 text-left">Expected</th><th className="px-5 py-3 text-left">Status</th>
                    </tr></thead>
                    <tbody className="divide-y divide-white/5">
                        {pos.map(po => (
                            <tr key={po.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-5 py-3 font-mono text-xs">{po.po_number}</td>
                                <td className="px-5 py-3">{po.suppliers?.name}</td>
                                <td className="px-5 py-3 text-white/60">{po.purchase_order_items?.length || 0}</td>
                                <td className="px-5 py-3 font-medium">${Number(po.total).toFixed(2)}</td>
                                <td className="px-5 py-3 text-white/40 text-xs">{po.expected_date || "—"}</td>
                                <td className="px-5 py-3">
                                    <select value={po.status} onChange={e => updateStatus(po.id, e.target.value)} className={`${statusColor(po.status)} border-0 rounded-lg px-2 py-1 text-xs font-medium focus:outline-none`}>
                                        {statuses.map(s => <option key={s} value={s} className="bg-neutral-900 text-white">{s}</option>)}
                                    </select>
                                </td>
                            </tr>
                        ))}
                        {pos.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-white/30">No purchase orders</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
