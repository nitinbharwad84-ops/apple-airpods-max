"use client";
import { useEffect, useState } from "react";
import type { AdminSession } from "../page";

interface Props { admin: AdminSession; supabase: any; }

export default function InventoryModule({ admin, supabase }: Props) {
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [adjustModal, setAdjustModal] = useState<any>(null);
    const [adjustQty, setAdjustQty] = useState("");
    const [adjustNotes, setAdjustNotes] = useState("");

    useEffect(() => { fetchInventory(); }, []);
    const fetchInventory = async () => {
        const { data } = await supabase.from("inventory").select("*").order("item_name");
        setInventory(data || []); setLoading(false);
    };

    const handleAdjust = async (e: React.FormEvent) => {
        e.preventDefault();
        const qty = parseInt(adjustQty);
        if (!qty || !adjustModal) return;
        await supabase.from("inventory").update({ current_stock: adjustModal.current_stock + qty }).eq("id", adjustModal.id);
        await supabase.from("inventory_transactions").insert({ inventory_id: adjustModal.id, transaction_type: "adjustment", quantity: qty, notes: adjustNotes, performed_by: admin.id });
        setAdjustModal(null); setAdjustQty(""); setAdjustNotes(""); fetchInventory();
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" /></div>;
    const lowStock = inventory.filter(i => i.current_stock <= i.reorder_point);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Inventory ({inventory.length} items)</h2>
                {lowStock.length > 0 && <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">⚠️ {lowStock.length} low stock</span>}
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead><tr className="border-b border-white/10 text-white/40 text-xs uppercase">
                        <th className="px-5 py-3 text-left">Item</th><th className="px-5 py-3 text-left">SKU</th>
                        <th className="px-5 py-3 text-left">Stock</th><th className="px-5 py-3 text-left">Reserved</th>
                        <th className="px-5 py-3 text-left">Available</th><th className="px-5 py-3 text-left">Reorder Point</th>
                        <th className="px-5 py-3 text-left">Unit Cost</th><th className="px-5 py-3 text-left">Location</th>
                        <th className="px-5 py-3 text-left">Actions</th>
                    </tr></thead>
                    <tbody className="divide-y divide-white/5">
                        {inventory.map(item => (
                            <tr key={item.id} className={`hover:bg-white/5 transition-colors ${item.current_stock <= item.reorder_point ? "bg-red-500/5" : ""}`}>
                                <td className="px-5 py-3 font-medium">{item.item_name}</td>
                                <td className="px-5 py-3 font-mono text-xs text-white/60">{item.sku}</td>
                                <td className="px-5 py-3"><span className={`font-bold ${item.current_stock <= item.reorder_point ? "text-red-400" : item.current_stock <= item.reorder_point * 2 ? "text-amber-400" : "text-green-400"}`}>{item.current_stock}</span></td>
                                <td className="px-5 py-3 text-white/40">{item.reserved_stock}</td>
                                <td className="px-5 py-3">{item.current_stock - item.reserved_stock}</td>
                                <td className="px-5 py-3 text-white/40">{item.reorder_point}</td>
                                <td className="px-5 py-3">${Number(item.unit_cost).toFixed(2)}</td>
                                <td className="px-5 py-3 text-white/40 text-xs">{item.location}</td>
                                <td className="px-5 py-3">
                                    <button onClick={() => setAdjustModal(item)} className="text-xs text-blue-400 hover:text-blue-300">Adjust</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {adjustModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-semibold mb-1">Adjust Stock</h3>
                        <p className="text-sm text-white/40 mb-4">{adjustModal.item_name} (Current: {adjustModal.current_stock})</p>
                        <form onSubmit={handleAdjust} className="space-y-4">
                            <input required type="number" value={adjustQty} onChange={e => setAdjustQty(e.target.value)} placeholder="Quantity (+/-)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                            <input value={adjustNotes} onChange={e => setAdjustNotes(e.target.value)} placeholder="Notes (optional)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500" />
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setAdjustModal(null)} className="flex-1 bg-white/5 hover:bg-white/10 rounded-xl py-3 text-sm transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 rounded-xl py-3 text-sm font-medium transition-colors">Apply</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
