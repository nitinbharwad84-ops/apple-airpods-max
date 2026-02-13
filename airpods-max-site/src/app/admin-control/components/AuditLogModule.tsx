"use client";
import { useEffect, useState } from "react";
import type { AdminSession } from "../page";
interface Props { admin: AdminSession; supabase: any; }

export default function AuditLogModule({ admin, supabase }: Props) {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.from("admin_audit_log").select("*").order("created_at", { ascending: false }).limit(100)
            .then(({ data }: any) => { setLogs(data || []); setLoading(false); });
    }, []);

    const actionColor = (a: string) => a === "login" ? "bg-blue-500/20 text-blue-400" : a === "create" ? "bg-green-500/20 text-green-400" : a === "update" ? "bg-amber-500/20 text-amber-400" : a === "delete" ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white/60";

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold">Audit Log (Last 100)</h2>
            <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead><tr className="border-b border-white/10 text-white/40 text-xs uppercase">
                        <th className="px-5 py-3 text-left">Time</th><th className="px-5 py-3 text-left">Admin</th>
                        <th className="px-5 py-3 text-left">Action</th><th className="px-5 py-3 text-left">Module</th>
                        <th className="px-5 py-3 text-left">Target</th>
                    </tr></thead>
                    <tbody className="divide-y divide-white/5">
                        {logs.map(l => (
                            <tr key={l.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-5 py-3 text-white/40 text-xs">{new Date(l.created_at).toLocaleString()}</td>
                                <td className="px-5 py-3 text-xs">{l.admin_email}</td>
                                <td className="px-5 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${actionColor(l.action)}`}>{l.action}</span></td>
                                <td className="px-5 py-3 text-white/60 text-xs">{l.module}</td>
                                <td className="px-5 py-3 text-white/40 text-xs font-mono">{l.target_id || "—"}</td>
                            </tr>
                        ))}
                        {logs.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-white/30">No audit logs</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
