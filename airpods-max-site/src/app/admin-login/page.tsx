"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

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
            // Check credentials against database
            // NOTE: For MVP/Demo, using plaintext password comparison. 
            // In production, compare hashed passwords.
            const { data, error } = await import("@/lib/supabase").then(m => m.supabase
                .from('admin_users')
                .select('*')
                .eq('email', email)
                .single()
            );

            if (error || !data || data.password !== password) {
                setError("Invalid email or password.");
                setIsLoading(false);
                return;
            }

            // Login specific logic
            const userSession = {
                email: data.email,
                role: data.role,
                permissions: data.permissions || []
            };

            localStorage.setItem("isAdminLoggedIn", "true");
            localStorage.setItem("adminUser", JSON.stringify(userSession));

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
                    <div className="inline-block mb-4">
                        <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.55 1.48-.55 2.83-1.55 3.23-1.07.41-2.24.02-2.78-1.42-.56-1.5.57-2.84 1.55-3.24 1.05-.43 2.15-.06 2.78 1.43" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight">Admin Control</h1>
                    <p className="text-white/40 text-sm mt-2">Sign in to access dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500 transition-colors"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500 transition-colors"
                            required
                        />
                    </div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-red-400 text-sm text-center"
                        >
                            {error}
                        </motion.p>
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
