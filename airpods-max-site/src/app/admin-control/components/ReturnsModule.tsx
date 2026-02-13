"use client";
import { useEffect, useState } from "react";
import type { AdminSession } from "../page";
interface Props { admin: AdminSession; supabase: any; }

export default function ReturnsModule({ admin, supabase }: Props) {
    const [returns, setReturns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchReturns(); }, []);
    const fetchReturns = async () => {
        const { data } = await supabase.from("returns").select("*, orders(order_number, shipping_name, total)").order("created_at", { ascending: false });
        setReturns(data || []); setLoading(false);
    };

    const updateStatus = async (id: string, status: string) => {
        await supabase.from("returns").update({ status, processed_by: admin.id }).eq("id", id);
        fetchReturns();
    };

    const statuses = ["Requested", "Approved", "Rejected", "Received", "Refunded", "Closed"];
    const reasonLabels: any = { defective: "Defective", wrong_item: "Wrong Item", not_as_described: "Not as Described", changed_mind: "Changed Mind", damaged_in_shipping: "Damaged in Shipping", other: "Other" };
    const statusColor = (s: string) => s === "Refunded" || s === "Closed" ? "bg-green-500/20 text-green-400" : s === "Rejected" ? "bg-red-500/20 text-red-400" : s === "Requested" ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400";

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold">Returns & Refunds ({returns.length})</h2>
            <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead><tr className="border-b border-white/10 text-white/40 text-xs uppercase">
                        <th className="px-5 py-3 text-left">Return #</th><th className="px-5 py-3 text-left">Order</th>
                        <th className="px-5 py-3 text-left">Customer</th><th className="px-5 py-3 text-left">Reason</th>
                        <th className="px-5 py-3 text-left">Refund</th><th className="px-5 py-3 text-left">Status</th>
                    </tr></thead>
                    <tbody className="divide-y divide-white/5">
                        {returns.map(r => (
                            <tr key={r.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-5 py-3 font-mono text-xs">{r.return_number}</td>
                                <td className="px-5 py-3 font-mono text-xs">{r.orders?.order_number}</td>
                                <td className="px-5 py-3">{r.orders?.shipping_name}</td>
                                <td className="px-5 py-3 text-white/60 text-xs">{reasonLabels[r.reason] || r.reason}</td>
                                <td className="px-5 py-3 font-medium">${Number(r.refund_amount).toFixed(2)}</td>
                                <td className="px-5 py-3">
                                    <select value={r.status} onChange={e => updateStatus(r.id, e.target.value)} className={`${statusColor(r.status)} border-0 rounded-lg px-2 py-1 text-xs font-medium focus:outline-none`}>
                                        {statuses.map(s => <option key={s} value={s} className="bg-neutral-900 text-white">{s}</option>)}
                                    </select>
                                </td>
                            </tr>
                        ))}
                        {returns.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-white/30">No returns</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
