"use client";
import { useEffect, useState } from "react";
import type { AdminSession } from "../page";
interface Props { admin: AdminSession; supabase: any; }

export default function TeamModule({ admin, supabase }: Props) {
    const [team, setTeam] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ email: "", password: "", full_name: "", role_id: "viewer" });

    useEffect(() => { fetchData(); }, []);
    const fetchData = async () => {
        // Use RPC or service role — these tables are locked down
        const [t, r] = await Promise.all([
            supabase.rpc("admin_login", { p_email: "_list_", p_password: "_list_" }).then(() => supabase.from("admin_users").select("id, email, role_id, full_name, is_active, last_login, created_at")),
            supabase.from("admin_roles").select("*"),
        ]);
        setTeam(t.data || []); setRoles(r.data || []); setLoading(false);
    };

    const [addError, setAddError] = useState("");
    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddError("");
        // Use secure RPC that hashes passwords server-side with bcrypt
        const { data, error } = await supabase.rpc("admin_create_user", {
            p_creator_id: admin.id,
            p_email: form.email,
            p_password: form.password,
            p_full_name: form.full_name,
            p_role_id: form.role_id,
        });
        if (error) { setAddError(error.message); return; }
        if (data && !data.success) { setAddError(data.error); return; }
        setShowModal(false); setForm({ email: "", password: "", full_name: "", role_id: "viewer" }); fetchData();
    };

    const toggleActive = async (user: any) => {
        await supabase.from("admin_users").update({ is_active: !user.is_active }).eq("id", user.id);
        fetchData();
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" /></div>;
    const isSuperAdmin = admin.role === "super_admin";

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Team Management ({team.length})</h2>
                {isSuperAdmin && <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-colors">+ Add Member</button>}
            </div>
            {!isSuperAdmin && <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-400">⚠️ Only Super Admins can manage team members.</div>}
            <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead><tr className="border-b border-white/10 text-white/40 text-xs uppercase">
                        <th className="px-5 py-3 text-left">Name</th><th className="px-5 py-3 text-left">Email</th>
                        <th className="px-5 py-3 text-left">Role</th><th className="px-5 py-3 text-left">Last Login</th>
                        <th className="px-5 py-3 text-left">Status</th>
                        {isSuperAdmin && <th className="px-5 py-3 text-left">Actions</th>}
                    </tr></thead>
                    <tbody className="divide-y divide-white/5">
                        {team.map(u => (
                            <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-5 py-3 font-medium">{u.full_name || "—"}</td>
                                <td className="px-5 py-3 text-white/60">{u.email}</td>
                                <td className="px-5 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role_id === "super_admin" ? "bg-purple-500/20 text-purple-400" : u.role_id === "admin" ? "bg-blue-500/20 text-blue-400" : "bg-white/10 text-white/60"}`}>
                                        {roles.find(r => r.id === u.role_id)?.label || u.role_id}
                                    </span>
                                </td>
                                <td className="px-5 py-3 text-white/40 text-xs">{u.last_login ? new Date(u.last_login).toLocaleDateString() : "Never"}</td>
                                <td className="px-5 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs ${u.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                                        {u.is_active ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                {isSuperAdmin && (
                                    <td className="px-5 py-3">
                                        {u.id !== admin.id && (
                                            <button onClick={() => toggleActive(u)} className="text-xs text-amber-400 hover:text-amber-300">
                                                {u.is_active ? "Deactivate" : "Activate"}
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Add Team Member</h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <input required value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Full Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                            <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                            <input required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Password" type="password" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                            <select required value={form.role_id} onChange={e => setForm({ ...form, role_id: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500">
                                {roles.map(r => <option key={r.id} value={r.id} className="bg-neutral-900">{r.label}</option>)}
                            </select>
                            {addError && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">{addError}</p>}
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 rounded-xl py-3 text-sm transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 rounded-xl py-3 text-sm font-medium transition-colors">Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
