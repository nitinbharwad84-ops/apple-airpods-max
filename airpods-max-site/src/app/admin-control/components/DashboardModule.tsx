"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { AdminSession } from "../page";

interface Props { admin: AdminSession; supabase: any; }

export default function DashboardModule({ admin, supabase }: Props) {
    const [stats, setStats] = useState({ revenue: 0, orders: 0, customers: 0, activeOrders: 0, lowStock: 0, returns: 0 });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [lowStockItems, setLowStockItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const [ordersRes, inventoryRes] = await Promise.all([
                supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }),
                supabase.from("inventory").select("*"),
            ]);

            const orders = ordersRes.data || [];
            const inventory = inventoryRes.data || [];

            const totalRev = orders.reduce((s: number, o: any) => s + Number(o.total), 0);
            const activeOrders = orders.filter((o: any) => o.status === "Processing").length;
            const uniqueCustomers = new Set(orders.map((o: any) => o.shipping_name)).size;
            const lowStock = inventory.filter((i: any) => i.current_stock <= i.reorder_point).length;

            setStats({ revenue: totalRev, orders: orders.length, customers: uniqueCustomers, activeOrders, lowStock, returns: 0 });
            setRecentOrders(orders.slice(0, 5));
            setLowStockItems(inventory.filter((i: any) => i.current_stock <= i.reorder_point).slice(0, 5));
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        }
        setLoading(false);
    };

    const statCards = [
        { label: "Total Revenue", value: `$${stats.revenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: "💰", color: "from-green-500/20 to-emerald-500/20", border: "border-green-500/20" },
        { label: "Total Orders", value: stats.orders, icon: "📦", color: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/20" },
        { label: "Active Orders", value: stats.activeOrders, icon: "⚡", color: "from-amber-500/20 to-yellow-500/20", border: "border-amber-500/20" },
        { label: "Customers", value: stats.customers, icon: "👥", color: "from-purple-500/20 to-pink-500/20", border: "border-purple-500/20" },
        { label: "Low Stock Items", value: stats.lowStock, icon: "⚠️", color: stats.lowStock > 0 ? "from-red-500/20 to-orange-500/20" : "from-white/5 to-white/5", border: stats.lowStock > 0 ? "border-red-500/20" : "border-white/5" },
        { label: "Returns", value: stats.returns, icon: "↩️", color: "from-white/5 to-white/5", border: "border-white/5" },
    ];

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Welcome back, {admin.full_name || admin.email.split("@")[0]}</h2>
                    <p className="text-white/40 text-sm mt-1">Here&apos;s your store overview</p>
                </div>
                <span className="text-xs text-white/20">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {statCards.map((card, i) => (
                    <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className={`bg-gradient-to-br ${card.color} border ${card.border} rounded-2xl p-4`}
                    >
                        <span className="text-xl">{card.icon}</span>
                        <p className="text-2xl font-bold mt-2">{card.value}</p>
                        <p className="text-xs text-white/40 mt-1">{card.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
                    <h3 className="font-semibold mb-4">Recent Orders</h3>
                    {recentOrders.length === 0 ? (
                        <p className="text-white/30 text-sm text-center py-8">No orders yet</p>
                    ) : (
                        <div className="space-y-3">
                            {recentOrders.map((order: any) => (
                                <div key={order.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                    <div>
                                        <p className="text-sm font-mono text-white/80">{order.order_number}</p>
                                        <p className="text-xs text-white/40">{order.shipping_name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">${Number(order.total).toFixed(2)}</p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${order.status === "Delivered" ? "bg-green-500/20 text-green-400" : order.status === "Processing" ? "bg-blue-500/20 text-blue-400" : "bg-amber-500/20 text-amber-400"}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
                    <h3 className="font-semibold mb-4">Low Stock Alerts</h3>
                    {lowStockItems.length === 0 ? (
                        <p className="text-white/30 text-sm text-center py-8">All stock levels healthy ✅</p>
                    ) : (
                        <div className="space-y-3">
                            {lowStockItems.map((item: any) => (
                                <div key={item.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                    <div>
                                        <p className="text-sm">{item.item_name}</p>
                                        <p className="text-xs text-white/40">SKU: {item.sku}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-bold ${item.current_stock <= 0 ? "text-red-400" : "text-amber-400"}`}>{item.current_stock} left</p>
                                        <p className="text-[10px] text-white/30">Reorder at {item.reorder_point}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
