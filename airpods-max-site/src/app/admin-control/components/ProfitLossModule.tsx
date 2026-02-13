"use client";
import { useEffect, useState } from "react";
import type { AdminSession } from "../page";
interface Props { admin: AdminSession; supabase: any; }

export default function ProfitLossModule({ admin, supabase }: Props) {
    const [orders, setOrders] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchData(); }, []);
    const fetchData = async () => {
        const [o, e, i] = await Promise.all([
            supabase.from("orders").select("total, discount_amount, status, created_at"),
            supabase.from("expenses").select("amount, expense_date, expense_categories(name)"),
            supabase.from("inventory").select("current_stock, unit_cost"),
        ]);
        setOrders(o.data || []); setExpenses(e.data || []); setInventory(i.data || []); setLoading(false);
    };

    const revenue = orders.filter(o => o.status !== "Cancelled" && o.status !== "Refunded").reduce((s, o) => s + Number(o.total), 0);
    const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const inventoryValue = inventory.reduce((s, i) => s + (i.current_stock * Number(i.unit_cost)), 0);
    const discounts = orders.reduce((s, o) => s + Number(o.discount_amount || 0), 0);
    const netProfit = revenue - totalExpenses;
    const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold">Profit & Loss Statement</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Revenue", value: `$${revenue.toFixed(2)}`, color: "text-green-400", bg: "from-green-500/10 to-emerald-500/10" },
                    { label: "Expenses", value: `$${totalExpenses.toFixed(2)}`, color: "text-red-400", bg: "from-red-500/10 to-orange-500/10" },
                    { label: "Net Profit", value: `$${netProfit.toFixed(2)}`, color: netProfit >= 0 ? "text-green-400" : "text-red-400", bg: netProfit >= 0 ? "from-green-500/10 to-emerald-500/10" : "from-red-500/10 to-orange-500/10" },
                    { label: "Profit Margin", value: `${margin.toFixed(1)}%`, color: margin >= 20 ? "text-green-400" : margin >= 0 ? "text-amber-400" : "text-red-400", bg: "from-purple-500/10 to-pink-500/10" },
                ].map(s => (
                    <div key={s.label} className={`bg-gradient-to-br ${s.bg} border border-white/5 rounded-2xl p-5`}>
                        <p className="text-xs text-white/40">{s.label}</p>
                        <p className={`text-3xl font-bold mt-2 ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
                    <h3 className="font-semibold mb-4">P&L Breakdown</h3>
                    <div className="space-y-3">
                        {[
                            { label: "Gross Revenue", value: revenue, positive: true },
                            { label: "Discounts Given", value: discounts, positive: false },
                            { label: "Net Revenue", value: revenue - discounts, positive: true },
                            { label: "Total Expenses", value: totalExpenses, positive: false },
                            { label: "Net Profit", value: netProfit, positive: netProfit >= 0, bold: true },
                        ].map(row => (
                            <div key={row.label} className={`flex justify-between items-center py-2 ${row.bold ? "border-t border-white/10 pt-3 mt-2" : ""}`}>
                                <span className={`text-sm ${row.bold ? "font-bold" : "text-white/60"}`}>{row.label}</span>
                                <span className={`font-medium ${row.positive ? "text-green-400" : "text-red-400"} ${row.bold ? "text-lg" : ""}`}>
                                    {row.positive ? "+" : "-"}${Math.abs(row.value).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
                    <h3 className="font-semibold mb-4">Assets</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-white/40">Inventory Value</p>
                            <p className="text-2xl font-bold text-blue-400 mt-1">${inventoryValue.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-white/40">Total Items in Stock</p>
                            <p className="text-2xl font-bold mt-1">{inventory.reduce((s, i) => s + i.current_stock, 0)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-white/40">Total Orders</p>
                            <p className="text-2xl font-bold mt-1">{orders.length}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
