"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

// Module imports
import DashboardModule from "./components/DashboardModule";
import OrdersModule from "./components/OrdersModule";
import ProductsModule from "./components/ProductsModule";
import InventoryModule from "./components/InventoryModule";
import CustomersModule from "./components/CustomersModule";
import CouponsModule from "./components/CouponsModule";
import SalesModule from "./components/SalesModule";
import ExpensesModule from "./components/ExpensesModule";
import ProfitLossModule from "./components/ProfitLossModule";
import ShippingModule from "./components/ShippingModule";
import ReturnsModule from "./components/ReturnsModule";
import SuppliersModule from "./components/SuppliersModule";
import PurchaseOrdersModule from "./components/PurchaseOrdersModule";
import ReportsModule from "./components/ReportsModule";
import TeamModule from "./components/TeamModule";
import AuditLogModule from "./components/AuditLogModule";
import NotificationsModule from "./components/NotificationsModule";
import SettingsModule from "./components/SettingsModule";

// Types
export interface AdminSession {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string | null;
    role: string;
    role_label: string;
    modules: string[];
}

// Module config
const MODULE_CONFIG: { id: string; label: string; icon: string; group: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "📊", group: "Overview" },
    { id: "orders", label: "Orders", icon: "📦", group: "Commerce" },
    { id: "products", label: "Products", icon: "🎧", group: "Commerce" },
    { id: "inventory", label: "Inventory", icon: "📋", group: "Commerce" },
    { id: "customers", label: "Customers", icon: "👥", group: "Commerce" },
    { id: "coupons", label: "Coupons", icon: "🏷️", group: "Commerce" },
    { id: "sales", label: "Sales & Revenue", icon: "💰", group: "Finance" },
    { id: "expenses", label: "Expenses", icon: "💳", group: "Finance" },
    { id: "profit_loss", label: "Profit & Loss", icon: "📈", group: "Finance" },
    { id: "shipping", label: "Shipping", icon: "🚚", group: "Operations" },
    { id: "returns", label: "Returns", icon: "↩️", group: "Operations" },
    { id: "suppliers", label: "Suppliers", icon: "🏭", group: "Operations" },
    { id: "purchase_orders", label: "Purchase Orders", icon: "📝", group: "Operations" },
    { id: "reports", label: "Reports", icon: "📑", group: "System" },
    { id: "team", label: "Team", icon: "🛡️", group: "System" },
    { id: "audit_log", label: "Audit Log", icon: "📜", group: "System" },
    { id: "notifications", label: "Notifications", icon: "🔔", group: "System" },
    { id: "settings", label: "Settings", icon: "⚙️", group: "System" },
];

export default function AdminControlPage() {
    const [admin, setAdmin] = useState<AdminSession | null>(null);
    const [activeModule, setActiveModule] = useState("dashboard");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
        const userData = localStorage.getItem("adminUser");
        if (!isLoggedIn || !userData) {
            router.push("/admin-login");
            return;
        }
        try {
            const parsed = JSON.parse(userData) as AdminSession;
            setAdmin(parsed);
        } catch {
            router.push("/admin-login");
            return;
        }
        setIsLoading(false);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("isAdminLoggedIn");
        localStorage.removeItem("adminUser");
        router.push("/admin-login");
    };

    const hasAccess = (moduleId: string): boolean => {
        if (!admin) return false;
        if (admin.role === "super_admin") return true;
        return admin.modules?.includes(moduleId) ?? false;
    };

    const accessibleModules = MODULE_CONFIG.filter(m => hasAccess(m.id));
    const groupedModules = accessibleModules.reduce((acc, m) => {
        if (!acc[m.group]) acc[m.group] = [];
        acc[m.group].push(m);
        return acc;
    }, {} as Record<string, typeof MODULE_CONFIG>);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-white/40 text-sm">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const renderModule = () => {
        const props = { admin: admin!, supabase };
        switch (activeModule) {
            case "dashboard": return <DashboardModule {...props} />;
            case "orders": return <OrdersModule {...props} />;
            case "products": return <ProductsModule {...props} />;
            case "inventory": return <InventoryModule {...props} />;
            case "customers": return <CustomersModule {...props} />;
            case "coupons": return <CouponsModule {...props} />;
            case "sales": return <SalesModule {...props} />;
            case "expenses": return <ExpensesModule {...props} />;
            case "profit_loss": return <ProfitLossModule {...props} />;
            case "shipping": return <ShippingModule {...props} />;
            case "returns": return <ReturnsModule {...props} />;
            case "suppliers": return <SuppliersModule {...props} />;
            case "purchase_orders": return <PurchaseOrdersModule {...props} />;
            case "reports": return <ReportsModule {...props} />;
            case "team": return <TeamModule {...props} />;
            case "audit_log": return <AuditLogModule {...props} />;
            case "notifications": return <NotificationsModule {...props} />;
            case "settings": return <SettingsModule {...props} />;
            default: return <DashboardModule {...props} />;
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex">
            {/* Sidebar */}
            <aside className={cn(
                "fixed left-0 top-0 h-full bg-[#111] border-r border-white/5 flex flex-col z-50 transition-all duration-300",
                sidebarCollapsed ? "w-[68px]" : "w-[240px]"
            )}>
                {/* Logo */}
                <div className="p-4 border-b border-white/5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        A
                    </div>
                    {!sidebarCollapsed && (
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold truncate">Admin ERP</p>
                            <p className="text-[10px] text-white/30 truncate">{admin?.role_label}</p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-thin">
                    {Object.entries(groupedModules).map(([group, modules]) => (
                        <div key={group}>
                            {!sidebarCollapsed && (
                                <p className="text-[10px] uppercase tracking-wider text-white/20 px-3 mb-1">{group}</p>
                            )}
                            <div className="space-y-0.5">
                                {modules.map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => setActiveModule(m.id)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                                            activeModule === m.id
                                                ? "bg-white/10 text-white"
                                                : "text-white/50 hover:text-white/80 hover:bg-white/5"
                                        )}
                                        title={sidebarCollapsed ? m.label : undefined}
                                    >
                                        <span className="text-base flex-shrink-0">{m.icon}</span>
                                        {!sidebarCollapsed && <span className="truncate">{m.label}</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Bottom */}
                <div className="p-3 border-t border-white/5 space-y-2">
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/40 hover:text-white/60 hover:bg-white/5 text-sm transition-all"
                    >
                        <span className="text-base">{sidebarCollapsed ? "→" : "←"}</span>
                        {!sidebarCollapsed && <span>Collapse</span>}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 text-sm transition-all"
                    >
                        <span className="text-base">🚪</span>
                        {!sidebarCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={cn(
                "flex-1 transition-all duration-300",
                sidebarCollapsed ? "ml-[68px]" : "ml-[240px]"
            )}>
                {/* Top Bar */}
                <header className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">
                            {MODULE_CONFIG.find(m => m.id === activeModule)?.icon}{" "}
                            {MODULE_CONFIG.find(m => m.id === activeModule)?.label}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setActiveModule("notifications")}
                            className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-sm transition-colors"
                        >
                            🔔
                        </button>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                                {admin?.full_name?.[0] || admin?.email?.[0] || "A"}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-xs font-medium">{admin?.full_name || admin?.email}</p>
                                <p className="text-[10px] text-white/30">{admin?.role_label}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Module Content */}
                <div className="p-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeModule}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderModule()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
