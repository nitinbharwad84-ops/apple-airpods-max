"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Types
interface Order {
    id: string;
    customer_name: string;
    items: any; // JSONB
    total: number;
    status: string;
    created_at: string;
}

interface Product {
    id: string;
    name: string;
    value: string; // Color hex
    price: number;
    image_url: string;
    filter_style?: string;
}

interface AdminUser {
    id: string;
    email: string;
    role: string;
    permissions: string[];
    created_at: string;
}

interface Coupon {
    id: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    expiry_date: string | null;
    is_active: boolean;
    usage_count: number;
}

type Tab = "dashboard" | "orders" | "products" | "customers" | "coupons" | "settings";

export default function AdminControlPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>("dashboard");

    // Data States
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [adminUsersList, setAdminUsersList] = useState<AdminUser[]>([]);
    const [currentUser, setCurrentUser] = useState<{ email: string, role: string, permissions: string[] } | null>(null);

    const [stats, setStats] = useState({
        revenue: 0,
        activeOrders: 0,
        totalCustomers: 0,
        inventoryStatus: "Good"
    });

    // Settings State
    const [adminProfile, setAdminProfile] = useState({
        name: "Admin User",
        email: "adminnitin@gmail.com",
        storeName: "Apple AirPods Max Store"
    });

    // Product Modal State
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [productForm, setProductForm] = useState({
        name: "",
        price: "",
        value: "#000000",
        image_url: "/products/airpods-max-select.png",
        filter_style: "none"
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
            const userStr = localStorage.getItem("adminUser");

            if (isLoggedIn !== "true") {
                router.push("/admin-login");
                return;
            }

            // Load user session if available, otherwise default to super admin for safety if missing (or redirect)
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    setCurrentUser(user);
                    setAdminProfile(prev => ({ ...prev, email: user.email }));
                    await fetchDashboardData(user);
                } catch (e) {
                    console.error("Failed to parse admin session");
                }
            } else {
                // Fallback for legacy login or manual overrides
                const fallbackUser = { email: 'adminnitin@gmail.com', role: 'super_admin', permissions: [] };
                setCurrentUser(fallbackUser as any);
                await fetchDashboardData(fallbackUser);
            }

            setIsLoading(false);
        };
        checkAuth();
    }, [router]);

    const hasAccess = (tab: string) => {
        if (!currentUser) return false;
        // Fallback for main admin or super_admin role
        if (currentUser.role === 'super_admin' || currentUser.email?.toLowerCase() === 'adminnitin@gmail.com') return true;

        // Check permissions array
        if (Array.isArray(currentUser.permissions)) {
            return currentUser.permissions.includes(tab);
        }
        // Handle case where permissions might be a stringified JSON
        if (typeof currentUser.permissions === 'string') {
            return (currentUser.permissions as string).includes(tab);
        }
        return false;
    };

    const fetchDashboardData = async (user?: any) => {
        try {
            // Fetch Orders
            const { data: ordersData } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            // Fetch Products
            const { data: productsData } = await supabase
                .from('products')
                .select('*')
                .order('name');

            // Fetch Coupons
            const { data: couponsData } = await supabase
                .from('coupons')
                .select('*')
                .order('created_at', { ascending: false });

            // Fetch Admin Users (Only if super_admin)
            // Use the passed user or current state
            const targetUser = user || currentUser;
            if (targetUser?.role === 'super_admin') {
                const { data: usersData } = await supabase
                    .from('admin_users')
                    .select('*');
                if (usersData) setAdminUsersList(usersData);
            }

            if (ordersData) {
                setOrders(ordersData);

                // Calculate Stats
                const totalRev = ordersData.reduce((sum, order) => sum + Number(order.total), 0);
                const active = ordersData.filter(o => o.status === 'Processing').length;
                const uniqueCustomers = new Set(ordersData.map(o => o.customer_name)).size;

                setStats({
                    revenue: totalRev,
                    activeOrders: active,
                    totalCustomers: uniqueCustomers,
                    inventoryStatus: "Good"
                });
            }

            if (productsData) {
                setProducts(productsData);
            }

            if (couponsData) {
                setCoupons(couponsData as Coupon[]);
            }

        } catch (error) {
            console.error("Error loading admin data", error);
        }
    };



    const handleLogout = () => {
        localStorage.removeItem("isAdminLoggedIn");
        localStorage.removeItem("adminUser");
        router.push("/admin-login");
    };

    // User Management Handlers
    const [newUserEmail, setNewUserEmail] = useState("");
    const [newUserPassword, setNewUserPassword] = useState("");
    const [newUserPermissions, setNewUserPermissions] = useState<string[]>([]);

    // Edit User State
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [editingPermissions, setEditingPermissions] = useState<string[]>([]);


    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('admin_users').insert([{
                email: newUserEmail,
                password: newUserPassword, // Plaintext for demo
                role: 'admin',
                permissions: newUserPermissions
            }]);

            if (error) throw error;

            alert("User added successfully!");
            setNewUserEmail("");
            setNewUserPassword("");
            setNewUserPermissions([]);
            // Refresh list
            const { data } = await supabase.from('admin_users').select('*');
            if (data) setAdminUsersList(data);

        } catch (err) {
            console.error("Error adding user:", err);
            alert("Failed to add user (Email might be duplicate).");
        }
    };

    const handleDeleteUser = async (id: string, email: string) => {
        if (email === currentUser?.email) {
            alert("You cannot delete yourself.");
            return;
        }
        if (!confirm(`Delete user ${email}?`)) return;

        await supabase.from('admin_users').delete().eq('id', id);
        setAdminUsersList(prev => prev.filter(u => u.id !== id));
    };

    const togglePermission = (perm: string, isEditing = false) => {
        if (isEditing) {
            setEditingPermissions(prev =>
                prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
            );
        } else {
            setNewUserPermissions(prev =>
                prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
            );
        }
    };

    const handleEditUser = (user: AdminUser) => {
        setEditingUser(user);
        setEditingPermissions(Array.isArray(user.permissions) ? user.permissions : []);
        setShowEditUserModal(true);
    };

    const handleSaveUserPermissions = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        try {
            const { error } = await supabase
                .from('admin_users')
                .update({ permissions: editingPermissions })
                .eq('id', editingUser.id);

            if (error) throw error;

            // Update local state
            setAdminUsersList(prev => prev.map(u =>
                u.id === editingUser.id ? { ...u, permissions: editingPermissions } : u
            ));

            setShowEditUserModal(false);
            setEditingUser(null);
        } catch (err) {
            console.error("Error updating permissions:", err);
            alert("Failed to update permissions.");
        }
    };

    // Settings Handlers
    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Profile updated locally! (In a real app, this would update your account)");
    };

    const handleClearOrders = async () => {
        if (!confirm("CRITICAL WARNING: This will permanently delete ALL orders. This action cannot be undone. Are you sure?")) return;

        try {
            const { error } = await supabase.from('orders').delete().neq('id', 'PLACEHOLDER'); // Delete all rows
            if (error) throw error;
            alert("All orders have been cleared database-wide.");
            await fetchDashboardData(); // Refresh stats
        } catch (err) {
            console.error("Error clearing orders:", err);
            alert("Failed to clear orders.");
        }
    };

    // Product Handlers
    const openProductModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setProductForm({
                name: product.name,
                price: product.price.toString(),
                value: product.value,
                image_url: product.image_url,
                filter_style: product.filter_style || "none"
            });
        } else {
            setEditingProduct(null);
            setProductForm({
                name: "",
                price: "549",
                value: "#000000",
                image_url: "/products/airpods-max-select.png",
                filter_style: "none"
            });
        }
        setShowProductModal(true);
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = {
                name: productForm.name,
                price: parseFloat(productForm.price),
                value: productForm.value,
                image_url: productForm.image_url,
                filter_style: productForm.filter_style
            };

            if (editingProduct) {
                const { error } = await supabase
                    .from('products')
                    .update(payload)
                    .eq('id', editingProduct.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('products')
                    .insert([payload]);
                if (error) throw error;
            }

            await fetchDashboardData();
            setShowProductModal(false);
        } catch (err) {
            console.error("Error saving product:", err);
            alert("Failed to save product.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            await fetchDashboardData();
        } catch (err) {
            console.error("Error deleting product:", err);
            alert("Failed to delete product.");
        }
    };

    // Coupon Handlers
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [couponForm, setCouponForm] = useState({
        code: "",
        discount_type: "percentage",
        discount_value: "",
        expiry_date: ""
    });

    const openCouponModal = (coupon?: Coupon) => {
        if (coupon) {
            setEditingCoupon(coupon);
            setCouponForm({
                code: coupon.code,
                discount_type: coupon.discount_type,
                discount_value: coupon.discount_value.toString(),
                expiry_date: coupon.expiry_date ? new Date(coupon.expiry_date).toISOString().split('T')[0] : ""
            });
        } else {
            setEditingCoupon(null);
            setCouponForm({
                code: "",
                discount_type: "percentage",
                discount_value: "",
                expiry_date: ""
            });
        }
        setShowCouponModal(true);
    };

    const handleSaveCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                code: couponForm.code.toUpperCase(),
                discount_type: couponForm.discount_type,
                discount_value: parseFloat(couponForm.discount_value),
                expiry_date: couponForm.expiry_date ? new Date(couponForm.expiry_date).toISOString() : null
            };

            if (editingCoupon) {
                const { error } = await supabase
                    .from('coupons')
                    .update(payload)
                    .eq('id', editingCoupon.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('coupons')
                    .insert([payload]);
                if (error) throw error;
            }

            await fetchDashboardData();
            setShowCouponModal(false);
        } catch (err) {
            console.error("Error saving coupon:", err);
            alert("Failed to save coupon.");
        }
    };

    const handleDeleteCoupon = async (id: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;
        try {
            const { error } = await supabase.from('coupons').delete().eq('id', id);
            if (error) throw error;
            setCoupons(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error("Error deleting coupon:", err);
            alert("Failed to delete coupon.");
        }
    };

    const toggleCouponStatus = async (coupon: Coupon) => {
        try {
            const { error } = await supabase
                .from('coupons')
                .update({ is_active: !coupon.is_active })
                .eq('id', coupon.id);
            if (error) throw error;
            setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, is_active: !c.is_active } : c));
        } catch (err) {
            console.error("Error updating coupon status:", err);
        }
    };

    if (isLoading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Admin...</div>;

    const formatItemsSummary = (itemsJson: any) => {
        try {
            const items = typeof itemsJson === 'string' ? JSON.parse(itemsJson) : itemsJson;
            if (Array.isArray(items)) {
                if (items.length === 1) return items[0].name;
                return `${items[0].name} + ${items.length - 1} more`;
            }
            return "Unknown Items";
        } catch (e) {
            return "Item details unavailable";
        }
    };

    // --- Sub-Components ---

    const OrdersTable = ({ limit }: { limit?: number }) => {
        const displayOrders = limit ? orders.slice(0, limit) : orders;
        return (
            <div className="bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-lg font-semibold">{limit ? "Recent Orders" : "All Orders"}</h2>
                    {limit && <button onClick={() => setActiveTab("orders")} className="text-sm text-blue-400 hover:text-blue-300">View All</button>}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-white/60">
                            <tr>
                                <th className="px-6 py-4 font-medium">Order ID</th>
                                <th className="px-6 py-4 font-medium">Customer</th>
                                <th className="px-6 py-4 font-medium">Items Summary</th>
                                <th className="px-6 py-4 font-medium">Total</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {displayOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white text-xs uppercase">{order.id}</td>
                                    <td className="px-6 py-4 text-white/80">{order.customer_name}</td>
                                    <td className="px-6 py-4 text-white/60 truncate max-w-[200px]">{formatItemsSummary(order.items)}</td>
                                    <td className="px-6 py-4 text-white">${Number(order.total).toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium",
                                            order.status === 'Delivered' ? 'bg-green-500/20 text-green-400' :
                                                order.status === 'Shipped' ? 'bg-blue-500/20 text-blue-400' :
                                                    'bg-yellow-500/20 text-yellow-400'
                                        )}
                                        >
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-white/40 text-xs">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {displayOrders.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-white/40">No orders found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const ProductsGrid = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
                <div key={product.id} className="bg-neutral-900 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center group hover:bg-neutral-800 transition-colors relative">
                    <div className="w-full h-40 relative mb-4 bg-white/5 rounded-xl flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-white/10 rounded-xl" style={{ backgroundColor: product.value, opacity: 0.1 }}></div>
                        <Image src={product.image_url} alt={product.name} width={150} height={150} className="object-contain" style={{ filter: product.filter_style || 'none' }} />
                    </div>
                    <h3 className="text-lg font-medium mb-1">{product.name}</h3>
                    <p className="text-white/60 mb-4">${product.price}</p>
                    <div className="flex gap-2 w-full mt-auto">
                        <button
                            onClick={() => openProductModal(product)}
                            className="flex-1 bg-white/10 hover:bg-white/20 text-sm py-2 rounded-lg transition-colors"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="flex-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm py-2 rounded-lg transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}
            {/* Add New Button */}
            <div
                onClick={() => openProductModal()}
                className="border border-dashed border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center text-white/40 hover:text-white hover:border-white/40 cursor-pointer transition-all min-h-[300px]"
            >
                <svg className="w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" /></svg>
                <span>Add New Product</span>
            </div>
        </div>
    );

    const CustomersList = () => {
        const customerMap = orders.reduce((acc, order) => {
            if (!acc[order.customer_name]) {
                acc[order.customer_name] = { name: order.customer_name, orders: 0, spent: 0, lastOrder: order.created_at };
            }
            acc[order.customer_name].orders += 1;
            acc[order.customer_name].spent += Number(order.total);
            if (new Date(order.created_at) > new Date(acc[order.customer_name].lastOrder)) {
                acc[order.customer_name].lastOrder = order.created_at;
            }
            return acc;
        }, {} as Record<string, any>);
        const customers = Object.values(customerMap);
        return (
            <div className="bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-white/60">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Total Orders</th>
                            <th className="px-6 py-4">Total Spent</th>
                            <th className="px-6 py-4">Last Active</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {customers.map((c, i) => (
                            <tr key={i} className="hover:bg-white/5">
                                <td className="px-6 py-4 font-medium text-white">{c.name}</td>
                                <td className="px-6 py-4 text-white/60">{c.orders}</td>
                                <td className="px-6 py-4 text-green-400">${c.spent.toFixed(2)}</td>
                                <td className="px-6 py-4 text-white/40">{new Date(c.lastOrder).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const CouponsManager = () => (
        <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-semibold">Coupon Management</h2>
                    <p className="text-white/60 text-sm">Create and manage discount codes.</p>
                </div>
                <button onClick={() => openCouponModal()} className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                    + Add Coupon
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-white/60">
                        <tr>
                            <th className="px-6 py-4">Code</th>
                            <th className="px-6 py-4">Discount</th>
                            <th className="px-6 py-4">Usage</th>
                            <th className="px-6 py-4">Expiry</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {coupons.map(coupon => (
                            <tr key={coupon.id} className="hover:bg-white/5">
                                <td className="px-6 py-4 font-mono font-bold text-white tracking-widest">{coupon.code}</td>
                                <td className="px-6 py-4 text-white">
                                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `$${coupon.discount_value}`}
                                </td>
                                <td className="px-6 py-4 text-white/60">{coupon.usage_count} uses</td>
                                <td className="px-6 py-4 text-white/60">
                                    {coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString() : 'No Expiry'}
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => toggleCouponStatus(coupon)}
                                        className={cn("px-2 py-1 rounded-full text-xs font-medium transition-colors",
                                            coupon.is_active ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                        )}
                                    >
                                        {coupon.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 flex gap-3">
                                    <button onClick={() => openCouponModal(coupon)} className="text-blue-400 hover:text-blue-300">Edit</button>
                                    <button onClick={() => handleDeleteCoupon(coupon.id)} className="text-red-400 hover:text-red-300">Delete</button>
                                </td>
                            </tr>
                        ))}
                        {coupons.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-white/40">No coupons created yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-black text-white flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 p-6 flex flex-col hidden md:flex sticky top-0 h-screen">
                <div className="flex items-center gap-3 mb-10">
                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.55 1.48-.55 2.83-1.55 3.23-1.07.41-2.24.02-2.78-1.42-.56-1.5.57-2.84 1.55-3.24 1.05-.43 2.15-.06 2.78 1.43" />
                    </svg>
                    <span className="font-semibold text-lg">Admin</span>
                </div>
                <nav className="space-y-2 flex-1">
                    {(['dashboard', 'orders', 'products', 'customers', 'coupons', 'settings'] as Tab[]).map((tab) => {
                        if (!hasAccess(tab)) return null;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "w-full text-left px-4 py-2 rounded-lg font-medium capitalize transition-colors",
                                    activeTab === tab ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {tab}
                            </button>
                        );
                    })}
                </nav>
                <div className="pt-6 border-t border-white/10 text-sm">

                    <p className="px-4 text-white/40 mb-2 text-xs truncate">{currentUser?.email || 'No Email'}</p>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-400 hover:text-red-300 hover:bg-white/5 rounded-lg transition-colors">Sign Out</button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 p-8 md:p-12">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl font-semibold mb-2 capitalize">{activeTab}</h1>
                        <p className="text-white/60">Overview of your store's {activeTab}.</p>
                    </div>
                    <Link href="/" className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors">View Store</Link>
                </header>

                {activeTab === "dashboard" && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                            {[
                                { label: "Total Revenue", value: `$${stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, positive: true },
                                { label: "Active Orders", value: stats.activeOrders, positive: true },
                                { label: "Customers", value: stats.totalCustomers, positive: true },
                                { label: "Inventory", value: "Good", positive: true },
                            ].map((stat, i) => (
                                <div key={i} className="bg-neutral-900 border border-white/10 p-6 rounded-2xl">
                                    <p className="text-white/40 text-sm font-medium mb-2">{stat.label}</p>
                                    <p className="text-2xl font-semibold">{stat.value}</p>
                                </div>
                            ))}
                        </div>
                        <OrdersTable limit={5} />
                    </>
                )}
                {activeTab === "orders" && <OrdersTable />}
                {activeTab === "products" && <ProductsGrid />}
                {activeTab === "customers" && <CustomersList />}
                {activeTab === "coupons" && <CouponsManager />}
                {activeTab === "settings" && (
                    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Profile Section */}
                        <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8">
                            <h2 className="text-xl font-semibold mb-6">Profile & Store</h2>
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm text-white/60">Admin Name</label>
                                        <input
                                            type="text"
                                            value={adminProfile.name}
                                            onChange={e => setAdminProfile({ ...adminProfile, name: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-white/60">Admin Email</label>
                                        <input
                                            type="email"
                                            value={adminProfile.email}
                                            onChange={e => setAdminProfile({ ...adminProfile, email: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm text-white/60">Store Name</label>
                                        <input
                                            type="text"
                                            value={adminProfile.storeName}
                                            onChange={e => setAdminProfile({ ...adminProfile, storeName: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <button type="submit" className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors shadow-lg shadow-white/10 text-sm">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Team Management Section (Super Admin Only) */}
                        {currentUser?.role === 'super_admin' && (
                            <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8">
                                <h2 className="text-xl font-semibold mb-6">Team Management</h2>
                                <p className="text-white/60 mb-6 text-sm">Manage user access and roles.</p>

                                {/* Add User Form */}
                                <form onSubmit={handleAddUser} className="bg-white/5 rounded-xl p-6 mb-8 border border-white/5">
                                    <h3 className="text-lg font-medium mb-4">Add New User</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <input
                                            type="email"
                                            placeholder="Email Address"
                                            value={newUserEmail}
                                            onChange={e => setNewUserEmail(e.target.value)}
                                            className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            value={newUserPassword}
                                            onChange={e => setNewUserPassword(e.target.value)}
                                            className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="text-sm text-white/60 mb-2 block">Access Permissions:</label>
                                        <div className="flex flex-wrap gap-3">
                                            {['dashboard', 'orders', 'products', 'customers', 'coupons', 'settings'].map(perm => (
                                                <label key={perm} className="flex items-center gap-2 cursor-pointer bg-black/30 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/30 transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        checked={newUserPermissions.includes(perm)}
                                                        onChange={() => togglePermission(perm, false)}
                                                        className="rounded border-white/20 bg-white/10"
                                                    />
                                                    <span className="capitalize text-sm">{perm}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">Add User</button>
                                </form>

                                {/* Users List */}
                                <div className="overflow-hidden bg-white/5 rounded-xl border border-white/5">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-white/5 text-white/60">
                                            <tr>
                                                <th className="px-6 py-3">User</th>
                                                <th className="px-6 py-3">Role</th>
                                                <th className="px-6 py-3">Permissions</th>
                                                <th className="px-6 py-3">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {adminUsersList.map(u => (
                                                <tr key={u.id} className="hover:bg-white/5">
                                                    <td className="px-6 py-3">{u.email}</td>
                                                    <td className="px-6 py-3 capitalize text-white/60">{u.role === 'super_admin' ? 'Super Admin' : 'Editor'}</td>
                                                    <td className="px-6 py-3">
                                                        {u.role === 'super_admin' ? (
                                                            <span className="text-green-400 text-xs bg-green-900/20 px-2 py-1 rounded">Full Access</span>
                                                        ) : (
                                                            <div className="flex gap-1 flex-wrap">
                                                                {u.permissions?.map(p => (
                                                                    <span key={p} className="text-xs bg-white/10 px-2 py-1 rounded capitalize">{p}</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        {u.role !== 'super_admin' && (
                                                            <div className="flex items-center gap-4">
                                                                <button onClick={() => handleEditUser(u)} className="text-blue-400 hover:text-blue-300 hover:underline">Edit</button>
                                                                <button onClick={() => handleDeleteUser(u.id, u.email)} className="text-red-400 hover:text-red-300 hover:underline">Remove</button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Data Management Section */}
                        <div className="bg-neutral-900 border border-red-500/20 rounded-3xl p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-32 bg-red-500/5 blur-3xl rounded-full pointer-events-none"></div>
                            <h2 className="text-xl font-semibold mb-2 text-red-500">Danger Zone</h2>
                            <p className="text-white/60 mb-6 text-sm">Irreversible actions for database management.</p>

                            <div className="space-y-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-white/5 rounded-xl bg-white/5 gap-4">
                                    <div>
                                        <h3 className="font-medium">Clear All Orders</h3>
                                        <p className="text-xs text-white/40 mt-1">Permanently remove all order records from the database.</p>
                                    </div>
                                    <button
                                        onClick={handleClearOrders}
                                        className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
                                    >
                                        Delete Orders
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Product Modal */}
            <AnimatePresence>
                {showProductModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-neutral-900 border border-white/10 rounded-3xl p-8 max-w-lg w-full shadow-2xl"
                        >
                            <h2 className="text-2xl font-semibold mb-6">{editingProduct ? "Edit Product" : "Add New Product"}</h2>
                            <form onSubmit={handleSaveProduct} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Product Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={productForm.name}
                                        onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">Price ($)</label>
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            value={productForm.price}
                                            onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">Color (Hex)</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={productForm.value}
                                                onChange={e => setProductForm({ ...productForm, value: e.target.value })}
                                                className="h-[50px] w-[50px] bg-transparent border-none cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={productForm.value}
                                                onChange={e => setProductForm({ ...productForm, value: e.target.value })}
                                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Image URL</label>
                                    <input
                                        required
                                        type="text"
                                        value={productForm.image_url}
                                        onChange={e => setProductForm({ ...productForm, image_url: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">CSS Filter (Optional)</label>
                                    <input
                                        type="text"
                                        value={productForm.filter_style}
                                        onChange={e => setProductForm({ ...productForm, filter_style: e.target.value })}
                                        placeholder="e.g. hue-rotate(90deg)"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowProductModal(false)}
                                        className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        {isSaving ? "Saving..." : "Save Product"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Coupon Modal */}
            <AnimatePresence>
                {showCouponModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-neutral-900 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl"
                        >
                            <h2 className="text-2xl font-semibold mb-6">{editingCoupon ? 'Edit Coupon' : 'New Coupon'}</h2>
                            <form onSubmit={handleSaveCoupon} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Coupon Code</label>
                                    <input
                                        type="text"
                                        required
                                        value={couponForm.code}
                                        onChange={e => setCouponForm({ ...couponForm, code: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 uppercase font-mono"
                                        placeholder="SUMMER2026"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">Type</label>
                                        <select
                                            value={couponForm.discount_type}
                                            onChange={e => setCouponForm({ ...couponForm, discount_type: e.target.value as any })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-white"
                                        >
                                            <option value="percentage" className="bg-neutral-900 text-white">Percentage (%)</option>
                                            <option value="fixed" className="bg-neutral-900 text-white">Fixed Amount ($)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">Value</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={couponForm.discount_value}
                                            onChange={e => setCouponForm({ ...couponForm, discount_value: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Expiry Date (Optional)</label>
                                    <input
                                        type="date"
                                        value={couponForm.expiry_date}
                                        onChange={e => setCouponForm({ ...couponForm, expiry_date: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCouponModal(false)}
                                        className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-colors"
                                    >
                                        Save Coupon
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* User Edit Modal */}
            <AnimatePresence>
                {showEditUserModal && editingUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-neutral-900 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl"
                        >
                            <h2 className="text-2xl font-semibold mb-2">Edit Permissions</h2>
                            <p className="text-white/60 mb-6 text-sm">Managing access for {editingUser.email}</p>

                            <form onSubmit={handleSaveUserPermissions}>
                                <div className="mb-6">
                                    <div className="space-y-3">
                                        {['dashboard', 'orders', 'products', 'customers', 'coupons', 'settings'].map(perm => (
                                            <label key={perm} className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                                <span className="capitalize">{perm}</span>
                                                <input
                                                    type="checkbox"
                                                    checked={editingPermissions.includes(perm)}
                                                    onChange={() => togglePermission(perm, true)}
                                                    className="w-5 h-5 rounded border-white/20 bg-black checked:bg-blue-500"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditUserModal(false)}
                                        className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}

