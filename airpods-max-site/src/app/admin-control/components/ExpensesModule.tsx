"use client";
import { useEffect, useState } from "react";
import type { AdminSession } from "../page";
interface Props { admin: AdminSession; supabase: any; }

export default function ExpensesModule({ admin, supabase }: Props) {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ title: "", category_id: "", amount: "", expense_date: new Date().toISOString().split("T")[0], description: "" });

    useEffect(() => { fetchData(); }, []);
    const fetchData = async () => {
        const [expRes, catRes] = await Promise.all([
            supabase.from("expenses").select("*, expense_categories(name, color)").order("expense_date", { ascending: false }),
            supabase.from("expense_categories").select("*").order("name"),
        ]);
        setExpenses(expRes.data || []); setCategories(catRes.data || []); setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await supabase.from("expenses").insert({ title: form.title, category_id: form.category_id || null, amount: parseFloat(form.amount), expense_date: form.expense_date, description: form.description, created_by: admin.id });
        setShowModal(false); setForm({ title: "", category_id: "", amount: "", expense_date: new Date().toISOString().split("T")[0], description: "" }); fetchData();
    };

    const handleDelete = async (id: string) => { if (confirm("Delete?")) { await supabase.from("expenses").delete().eq("id", id); fetchData(); } };
    const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">Expenses</h2>
                    <p className="text-white/40 text-sm">Total: <span className="text-red-400 font-medium">${totalExpenses.toFixed(2)}</span></p>
                </div>
                <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-colors">+ Add Expense</button>
            </div>

            {/* Category breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {categories.map(cat => {
                    const catTotal = expenses.filter(e => e.category_id === cat.id).reduce((s, e) => s + Number(e.amount), 0);
                    return (
                        <div key={cat.id} className="bg-white/5 border border-white/5 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                <span className="text-xs text-white/60">{cat.name}</span>
                            </div>
                            <p className="text-lg font-bold">${catTotal.toFixed(2)}</p>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead><tr className="border-b border-white/10 text-white/40 text-xs uppercase">
                        <th className="px-5 py-3 text-left">Date</th><th className="px-5 py-3 text-left">Title</th>
                        <th className="px-5 py-3 text-left">Category</th><th className="px-5 py-3 text-left">Amount</th>
                        <th className="px-5 py-3 text-left">Actions</th>
                    </tr></thead>
                    <tbody className="divide-y divide-white/5">
                        {expenses.map(e => (
                            <tr key={e.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-5 py-3 text-white/40 text-xs">{new Date(e.expense_date).toLocaleDateString()}</td>
                                <td className="px-5 py-3 font-medium">{e.title}</td>
                                <td className="px-5 py-3">
                                    {e.expense_categories ? (
                                        <span className="inline-flex items-center gap-1.5 text-xs"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.expense_categories.color }} />{e.expense_categories.name}</span>
                                    ) : <span className="text-white/30 text-xs">Uncategorized</span>}
                                </td>
                                <td className="px-5 py-3 font-medium text-red-400">${Number(e.amount).toFixed(2)}</td>
                                <td className="px-5 py-3"><button onClick={() => handleDelete(e.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button></td>
                            </tr>
                        ))}
                        {expenses.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-white/30">No expenses recorded</td></tr>}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Add Expense</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                            <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500">
                                <option value="" className="bg-neutral-900">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id} className="bg-neutral-900">{c.name}</option>)}
                            </select>
                            <div className="flex gap-3">
                                <input required type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="Amount" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                                <input type="date" value={form.expense_date} onChange={e => setForm({ ...form, expense_date: e.target.value })} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 rounded-xl py-3 text-sm transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 rounded-xl py-3 text-sm font-medium transition-colors">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
