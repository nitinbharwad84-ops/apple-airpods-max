"use client";
import { useEffect, useState } from "react";
import type { AdminSession } from "../page";
interface Props { admin: AdminSession; supabase: any; }

export default function ReportsModule({ admin, supabase }: Props) {
    const [orders, setOrders] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            supabase.from("orders").select("total, status, created_at, coupon_code, discount_amount"),
            supabase.from("expenses").select("amount, expense_date, expense_categories(name)"),
        ]).then(([o, e]) => { setOrders(o.data || []); setExpenses(e.data || []); setLoading(false); });
    }, []);

    const revenue = orders.reduce((s, o) => s + Number(o.total), 0);
    const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const topCoupons = Object.entries(orders.filter(o => o.coupon_code).reduce((acc: any, o) => { acc[o.coupon_code] = (acc[o.coupon_code] || 0) + Number(o.discount_amount || 0); return acc; }, {})).sort((a: any, b: any) => b[1] - a[1]) as [string, number][];

    // Monthly summary
    const monthly = orders.reduce((acc: any, o) => {
        const m = new Date(o.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short" });
        if (!acc[m]) acc[m] = { month: m, revenue: 0, orders: 0 };
        acc[m].revenue += Number(o.total); acc[m].orders++; return acc;
    }, {});

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold">Reports</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
                    <h3 className="font-semibold mb-4">Monthly Summary</h3>
                    <div className="space-y-2">
                        {Object.values(monthly).length === 0 ? <p className="text-white/30 text-sm text-center py-4">No data</p> : (Object.values(monthly) as any[]).reverse().map((m: any) => (
                            <div key={m.month} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                <span className="text-sm text-white/60">{m.month}</span>
                                <div className="flex gap-4">
                                    <span className="text-sm font-medium text-green-400">${m.revenue.toFixed(2)}</span>
                                    <span className="text-xs text-white/30">{m.orders} orders</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
                    <h3 className="font-semibold mb-4">Financial Overview</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between py-2"><span className="text-white/60">Total Revenue</span><span className="font-medium text-green-400">${revenue.toFixed(2)}</span></div>
                        <div className="flex justify-between py-2"><span className="text-white/60">Total Expenses</span><span className="font-medium text-red-400">${totalExpenses.toFixed(2)}</span></div>
                        <div className="flex justify-between py-2 border-t border-white/10 pt-3"><span className="font-bold">Net Profit</span><span className={`font-bold ${revenue - totalExpenses >= 0 ? "text-green-400" : "text-red-400"}`}>${(revenue - totalExpenses).toFixed(2)}</span></div>
                    </div>
                    <h4 className="font-semibold mt-6 mb-3 text-sm">Top Coupons Used</h4>
                    {topCoupons.length === 0 ? <p className="text-white/30 text-xs">No coupons used</p> : topCoupons.slice(0, 5).map(([code, amount]) => (
                        <div key={code} className="flex justify-between py-1"><span className="font-mono text-xs text-white/60">{code}</span><span className="text-xs text-amber-400">-${(amount as number).toFixed(2)}</span></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
