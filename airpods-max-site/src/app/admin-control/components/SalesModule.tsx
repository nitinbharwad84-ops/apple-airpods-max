"use client";
import { useEffect, useState } from "react";
import type { AdminSession } from "../page";
interface Props { admin: AdminSession; supabase: any; }

export default function SalesModule({ admin, supabase }: Props) {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.from("orders").select("*").order("created_at", { ascending: false }).then(({ data }: any) => { setOrders(data || []); setLoading(false); });
    }, []);

    const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
    const totalDiscount = orders.reduce((s, o) => s + Number(o.discount_amount || 0), 0);
    const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;
    const paidOrders = orders.filter(o => o.payment_status === "paid");

    // Group by date
    const daily = orders.reduce((acc: any, o) => {
        const d = new Date(o.created_at).toLocaleDateString();
        if (!acc[d]) acc[d] = { date: d, revenue: 0, orders: 0 };
        acc[d].revenue += Number(o.total); acc[d].orders++;
        return acc;
    }, {});
    const dailyData = Object.values(daily) as any[];

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold">Sales & Revenue</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, color: "text-green-400" },
                    { label: "Avg Order Value", value: `$${avgOrderValue.toFixed(2)}`, color: "text-blue-400" },
                    { label: "Total Discounts", value: `$${totalDiscount.toFixed(2)}`, color: "text-amber-400" },
                    { label: "Paid Orders", value: paidOrders.length, color: "text-purple-400" },
                ].map(s => (
                    <div key={s.label} className="bg-white/5 border border-white/5 rounded-2xl p-4">
                        <p className="text-xs text-white/40">{s.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Revenue by Day bar chart */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
                <h3 className="font-semibold mb-4">Daily Revenue</h3>
                {dailyData.length === 0 ? <p className="text-white/30 text-sm text-center py-8">No sales data</p> : (
                    <div className="space-y-2">
                        {dailyData.slice(-10).map((d: any) => {
                            const pct = (d.revenue / Math.max(...dailyData.map((x: any) => x.revenue))) * 100;
                            return (
                                <div key={d.date} className="flex items-center gap-3">
                                    <span className="text-xs text-white/40 w-24 flex-shrink-0">{d.date}</span>
                                    <div className="flex-1 bg-white/5 rounded-full h-6 overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center px-2" style={{ width: `${Math.max(pct, 5)}%` }}>
                                            <span className="text-[10px] font-medium whitespace-nowrap">${d.revenue.toFixed(0)}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs text-white/30 w-16 text-right">{d.orders} ord.</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
