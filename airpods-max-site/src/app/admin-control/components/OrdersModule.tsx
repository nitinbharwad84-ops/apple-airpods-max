"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AdminSession } from "../page";

interface Props { admin: AdminSession; supabase: any; }

export default function OrdersModule({ admin, supabase }: Props) {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        const { data } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
        setOrders(data || []);
        setLoading(false);
    };

    const updateStatus = async (id: string, status: string) => {
        await supabase.from("orders").update({ status }).eq("id", id);
        fetchOrders();
    };

    const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);
    const statuses = ["Processing", "Confirmed", "Shipped", "Delivered", "Cancelled", "Refunded"];

    const statusColor = (s: string) => {
        switch (s) {
            case "Processing": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
            case "Confirmed": return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
            case "Shipped": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
            case "Delivered": return "bg-green-500/20 text-green-400 border-green-500/30";
            case "Cancelled": return "bg-red-500/20 text-red-400 border-red-500/30";
            case "Refunded": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
            default: return "bg-white/10 text-white/60 border-white/10";
        }
    };

    const paymentColor = (s: string) => {
        switch (s) {
            case "paid": return "bg-green-500/20 text-green-400";
            case "pending": return "bg-amber-500/20 text-amber-400";
            case "failed": return "bg-red-500/20 text-red-400";
            case "refunded": return "bg-purple-500/20 text-purple-400";
            default: return "bg-white/10 text-white/60";
        }
    };

    // Summary stats
    const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
    const processingCount = orders.filter(o => o.status === "Processing").length;
    const deliveredCount = orders.filter(o => o.status === "Delivered").length;

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Orders", value: orders.length, icon: "📦" },
                    { label: "Processing", value: processingCount, icon: "⏳" },
                    { label: "Delivered", value: deliveredCount, icon: "✅" },
                    { label: "Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: "💰" },
                ].map(s => (
                    <div key={s.label} className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center gap-3">
                        <span className="text-xl">{s.icon}</span>
                        <div>
                            <p className="text-lg font-bold">{s.value}</p>
                            <p className="text-[10px] text-white/40">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl font-bold">Orders</h2>
                <div className="flex gap-2 flex-wrap">
                    {["all", ...statuses].map(s => (
                        <button key={s} onClick={() => setFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? "bg-white text-black" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
                        >{s === "all" ? `All (${orders.length})` : `${s} (${orders.filter(o => o.status === s).length})`}</button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-12 text-center text-white/30">No orders found</div>
                ) : filtered.map(order => (
                    <div key={order.id} className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all">
                        {/* Order Header — Click to Expand */}
                        <button
                            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                        >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="flex flex-col">
                                    <span className="font-mono text-sm font-semibold text-white">{order.order_number}</span>
                                    <span className="text-xs text-white/30 mt-0.5">{new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-sm text-white/80">{order.shipping_name}</p>
                                    <p className="text-xs text-white/30">{order.shipping_city}{order.shipping_state ? `, ${order.shipping_state}` : ""}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-white/40">{order.order_items?.length || 0} item(s)</span>
                                <span className="text-sm font-semibold">${Number(order.total).toFixed(2)}</span>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColor(order.status)}`}>{order.status}</span>
                                <motion.span
                                    animate={{ rotate: expandedOrder === order.id ? 180 : 0 }}
                                    className="text-white/30 text-sm"
                                >
                                    ▼
                                </motion.span>
                            </div>
                        </button>

                        {/* Expanded Detail */}
                        <AnimatePresence>
                            {expandedOrder === order.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-5 pb-5 border-t border-white/5">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-4">
                                            {/* Column 1: Order Items */}
                                            <div className="lg:col-span-2">
                                                <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3">Order Items</h4>
                                                <div className="space-y-2">
                                                    {(order.order_items || []).map((item: any, idx: number) => (
                                                        <div key={item.id || idx} className="flex items-center justify-between bg-white/[0.03] rounded-xl px-4 py-3 border border-white/5">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${item.item_type === "product" ? "bg-blue-500/20" : "bg-purple-500/20"}`}>
                                                                    {item.item_type === "product" ? "🎧" : "🔌"}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium">{item.item_name}</p>
                                                                    <div className="flex gap-2 mt-0.5">
                                                                        <span className="text-[10px] text-white/30">{item.item_type}</span>
                                                                        {item.color_name && <span className="text-[10px] text-white/40">• {item.color_name}</span>}
                                                                        <span className="text-[10px] text-white/30">× {item.quantity}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm font-medium">${Number(item.line_total).toFixed(2)}</p>
                                                                <p className="text-[10px] text-white/30">${Number(item.item_price).toFixed(2)} each</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {(!order.order_items || order.order_items.length === 0) && (
                                                        <p className="text-white/30 text-sm text-center py-4">No items recorded</p>
                                                    )}

                                                    {/* Price Breakdown */}
                                                    <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5 px-1">
                                                        <div className="flex justify-between text-sm text-white/50">
                                                            <span>Subtotal</span>
                                                            <span>${Number(order.subtotal).toFixed(2)}</span>
                                                        </div>
                                                        {Number(order.discount_amount) > 0 && (
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-green-400">Discount {order.coupon_code && <span className="font-mono text-xs">({order.coupon_code})</span>}</span>
                                                                <span className="text-green-400">-${Number(order.discount_amount).toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                        {Number(order.shipping_cost) > 0 && (
                                                            <div className="flex justify-between text-sm text-white/50">
                                                                <span>Shipping</span>
                                                                <span>${Number(order.shipping_cost).toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                        {Number(order.tax_amount) > 0 && (
                                                            <div className="flex justify-between text-sm text-white/50">
                                                                <span>Tax</span>
                                                                <span>${Number(order.tax_amount).toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between text-base font-bold pt-2 border-t border-white/10">
                                                            <span>Total</span>
                                                            <span>${Number(order.total).toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Column 2: Shipping & Payment Info */}
                                            <div className="space-y-4">
                                                {/* Shipping Address */}
                                                <div>
                                                    <h4 className="text-xs text-white/40 uppercase tracking-wider mb-2">Shipping Address</h4>
                                                    <div className="bg-white/[0.03] rounded-xl px-4 py-3 border border-white/5 space-y-1">
                                                        <p className="text-sm font-medium">{order.shipping_name}</p>
                                                        <p className="text-xs text-white/50">{order.shipping_address}</p>
                                                        <p className="text-xs text-white/50">
                                                            {order.shipping_city}{order.shipping_state ? `, ${order.shipping_state}` : ""} {order.shipping_zip}
                                                        </p>
                                                        <p className="text-xs text-white/50">{order.shipping_country}</p>
                                                        {order.shipping_phone && <p className="text-xs text-white/40 mt-1">📱 {order.shipping_phone}</p>}
                                                    </div>
                                                </div>

                                                {/* Payment */}
                                                <div>
                                                    <h4 className="text-xs text-white/40 uppercase tracking-wider mb-2">Payment</h4>
                                                    <div className="bg-white/[0.03] rounded-xl px-4 py-3 border border-white/5 space-y-2">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs text-white/50">Method</span>
                                                            <span className="text-sm capitalize">{order.payment_method || "Card"}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs text-white/50">Status</span>
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${paymentColor(order.payment_status)}`}>
                                                                {order.payment_status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Status Update */}
                                                <div>
                                                    <h4 className="text-xs text-white/40 uppercase tracking-wider mb-2">Update Status</h4>
                                                    <select
                                                        value={order.status}
                                                        onChange={e => updateStatus(order.id, e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                                                    >
                                                        {statuses.map(s => <option key={s} value={s} className="bg-neutral-900">{s}</option>)}
                                                    </select>
                                                </div>

                                                {/* Notes */}
                                                {order.notes && (
                                                    <div>
                                                        <h4 className="text-xs text-white/40 uppercase tracking-wider mb-2">Notes</h4>
                                                        <p className="text-sm text-white/60 bg-white/[0.03] rounded-xl px-4 py-3 border border-white/5">{order.notes}</p>
                                                    </div>
                                                )}

                                                {/* Meta */}
                                                <div className="text-[10px] text-white/20 space-y-0.5 pt-2">
                                                    <p>Order ID: {order.id}</p>
                                                    <p>User ID: {order.user_id || "Guest"}</p>
                                                    <p>Created: {new Date(order.created_at).toLocaleString()}</p>
                                                    <p>Updated: {new Date(order.updated_at).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
}
