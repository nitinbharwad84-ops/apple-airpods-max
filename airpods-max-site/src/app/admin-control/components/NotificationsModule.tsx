"use client";
import { useEffect, useState } from "react";
import type { AdminSession } from "../page";
interface Props { admin: AdminSession; supabase: any; }

export default function NotificationsModule({ admin, supabase }: Props) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50)
            .then(({ data }: any) => { setNotifications(data || []); setLoading(false); });
    }, []);

    const markRead = async (id: string) => {
        await supabase.from("notifications").update({ is_read: true }).eq("id", id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    };

    const markAllRead = async () => {
        await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    };

    const typeIcon: any = { info: "ℹ️", warning: "⚠️", error: "❌", success: "✅", order: "📦", stock: "📋", return: "↩️" };
    const unread = notifications.filter(n => !n.is_read).length;

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Notifications {unread > 0 && <span className="text-sm text-blue-400 ml-2">({unread} unread)</span>}</h2>
                {unread > 0 && <button onClick={markAllRead} className="text-xs text-blue-400 hover:text-blue-300">Mark all read</button>}
            </div>
            <div className="space-y-2">
                {notifications.length === 0 ? (
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-12 text-center text-white/30">No notifications</div>
                ) : notifications.map(n => (
                    <div key={n.id} className={`flex items-start gap-3 p-4 rounded-xl border transition-colors cursor-pointer ${n.is_read ? "bg-white/[0.02] border-white/5" : "bg-white/5 border-white/10"}`} onClick={() => !n.is_read && markRead(n.id)}>
                        <span className="text-lg mt-0.5">{typeIcon[n.type] || "🔔"}</span>
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${n.is_read ? "text-white/60" : ""}`}>{n.title}</p>
                            <p className="text-xs text-white/40 mt-0.5">{n.message}</p>
                            <p className="text-[10px] text-white/20 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                        </div>
                        {!n.is_read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />}
                    </div>
                ))}
            </div>
        </div>
    );
}
