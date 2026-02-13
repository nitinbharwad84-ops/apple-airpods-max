"use client";
import { useEffect, useState } from "react";
import type { AdminSession } from "../page";
interface Props { admin: AdminSession; supabase: any; }

export default function SettingsModule({ admin, supabase }: Props) {
    const [settings, setSettings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editKey, setEditKey] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");

    useEffect(() => {
        supabase.from("store_settings").select("*").order("key").then(({ data }: any) => { setSettings(data || []); setLoading(false); });
    }, []);

    const handleSave = async (key: string) => {
        try {
            const parsed = JSON.parse(editValue);
            await supabase.from("store_settings").update({ value: parsed, updated_by: admin.id }).eq("key", key);
            setSettings(prev => prev.map(s => s.key === key ? { ...s, value: parsed } : s));
            setEditKey(null);
        } catch { alert("Invalid JSON value"); }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold">Store Settings</h2>
            <div className="space-y-3">
                {settings.map(s => (
                    <div key={s.key} className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{s.key.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}</p>
                            <p className="text-xs text-white/30 mt-0.5">{s.description}</p>
                        </div>
                        {editKey === s.key ? (
                            <div className="flex gap-2">
                                <input value={editValue} onChange={e => setEditValue(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono w-48 focus:outline-none focus:border-blue-500" />
                                <button onClick={() => handleSave(s.key)} className="text-xs bg-blue-600 hover:bg-blue-500 rounded-lg px-3 py-2 transition-colors">Save</button>
                                <button onClick={() => setEditKey(null)} className="text-xs bg-white/5 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors">✕</button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-sm text-white/80 bg-white/5 px-3 py-1.5 rounded-lg">{JSON.stringify(s.value)}</span>
                                <button onClick={() => { setEditKey(s.key); setEditValue(JSON.stringify(s.value)); }} className="text-xs text-blue-400 hover:text-blue-300">Edit</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 mt-8">
                <h3 className="font-semibold mb-3">Account Info</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-white/40">Email</span><span>{admin.email}</span></div>
                    <div className="flex justify-between"><span className="text-white/40">Name</span><span>{admin.full_name || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-white/40">Role</span><span className="text-purple-400">{admin.role_label}</span></div>
                    <div className="flex justify-between"><span className="text-white/40">Modules Access</span><span className="text-xs text-white/60">{admin.modules?.length || 0} modules</span></div>
                </div>
            </div>
        </div>
    );
}
