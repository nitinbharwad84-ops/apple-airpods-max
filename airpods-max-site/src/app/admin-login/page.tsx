"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            // Use secure RPC function — password never exposed to client
            const { data, error: rpcError } = await supabase.rpc('admin_login', {
                p_email: email.toLowerCase().trim(),
                p_password: password
            });

            if (rpcError) {
                console.error("RPC error:", rpcError);
                setError("Login service unavailable. Please try again.");
                setIsLoading(false);
                return;
            }

            if (!data?.success) {
                setError(data?.error || "Invalid email or password.");
                setIsLoading(false);
                return;
            }

            // Store admin session
            const adminSession = {
                id: data.user.id,
                email: data.user.email,
                full_name: data.user.full_name,
                avatar_url: data.user.avatar_url,
                role: data.user.role,
                role_label: data.user.role_label,
                modules: data.user.modules
            };

            localStorage.setItem("isAdminLoggedIn", "true");
            localStorage.setItem("adminUser", JSON.stringify(adminSession));

            router.push("/admin-control");
        } catch (err) {
            console.error("Login error:", err);
            setError("An unexpected error occurred.");
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Ambient */}
            <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm z-10"
            >
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 mb-4">
                        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.55 1.48-.55 2.83-1.55 3.23-1.07.41-2.24.02-2.78-1.42-.56-1.5.57-2.84 1.55-3.24 1.05-.43 2.15-.06 2.78 1.43" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight">Admin Portal</h1>
                    <p className="text-white/40 text-sm mt-2">Secure access to management dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs text-white/40 uppercase tracking-wider">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@example.com"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500 transition-colors"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-white/40 uppercase tracking-wider">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500 transition-colors"
                            required
                        />
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
                        >
                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-white text-black font-semibold rounded-xl py-3 hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : "Sign In"}
                    </button>

                    <div className="text-center mt-6">
                        <Link href="/" className="text-white/20 hover:text-white/40 text-sm transition-colors">
                            Back to Store
                        </Link>
                    </div>
                </form>
            </motion.div>
        </main>
    );
}
