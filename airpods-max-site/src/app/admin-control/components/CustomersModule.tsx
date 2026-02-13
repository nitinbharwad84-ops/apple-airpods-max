"use client";
import { useEffect, useState } from "react";
import type { AdminSession } from "../page";
interface Props { admin: AdminSession; supabase: any; }

export default function CustomersModule({ admin, supabase }: Props) {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        supabase.from("orders").select("*").order("created_at", { ascending: false }).then(({ data }: any) => { setOrders(data || []); setLoading(false); });
    }, []);

    const customers = Object.values(orders.reduce((acc: any, o: any) => {
        const k = o.shipping_name;
        if (!acc[k]) acc[k] = { name: k, orders: 0, spent: 0, lastOrder: o.created_at, city: o.shipping_city };
        acc[k].orders++; acc[k].spent += Number(o.total);
        if (new Date(o.created_at) > new Date(acc[k].lastOrder)) acc[k].lastOrder = o.created_at;
        return acc;
    }, {})) as any[];

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold">Customers ({customers.length})</h2>
            <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead><tr className="border-b border-white/10 text-white/40 text-xs uppercase">
                        <th className="px-5 py-3 text-left">Customer</th><th className="px-5 py-3 text-left">City</th>
                        <th className="px-5 py-3 text-left">Orders</th><th className="px-5 py-3 text-left">Total Spent</th>
                        <th className="px-5 py-3 text-left">Last Order</th>
                    </tr></thead>
                    <tbody className="divide-y divide-white/5">
                        {customers.sort((a, b) => b.spent - a.spent).map((c, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                                <td className="px-5 py-3 font-medium">{c.name}</td>
                                <td className="px-5 py-3 text-white/60">{c.city || "—"}</td>
                                <td className="px-5 py-3">{c.orders}</td>
                                <td className="px-5 py-3 font-medium text-green-400">${c.spent.toFixed(2)}</td>
                                <td className="px-5 py-3 text-white/40 text-xs">{new Date(c.lastOrder).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        {customers.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-white/30">No customers yet</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
