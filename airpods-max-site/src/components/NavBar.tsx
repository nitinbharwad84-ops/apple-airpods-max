"use client";

import { motion, useScroll, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function NavBar() {
    const { scrollY } = useScroll();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const pathname = usePathname();

    useEffect(() => {
        return scrollY.on("change", (latest) => {
            setIsScrolled(latest > 20);
        });
    }, [scrollY]);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        // optionally redirect or refresh, but state update handles UI
    };

    const navLinks = [
        { name: "Overview", href: "/" },
        { name: "About", href: "/about" },
        { name: "Specs", href: "/product-details" },
    ];

    return (
        <>
            <motion.nav
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    isScrolled
                        ? "bg-black/80 backdrop-blur-xl border-b border-white/5 py-3 shadow-lg"
                        : "bg-transparent border-transparent py-5"
                )}
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className="flex items-center gap-6">
                    {/* Apple Logo */}
                    <Link href="/" className="text-white hover:opacity-80 transition-opacity">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.05 19.32c-.5.16-1.12.3-1.63.3-1.08 0-2.31-.61-3.66-.61-1.34 0-2.45.61-3.63.61-.92 0-1.61-.16-2-.27-.37-.09-4.88-1.92-4.88-7.39 0-4.94 3.73-7.53 4.88-7.53 1.25 0 2.22.61 3.25 1.53.94-.84 2.14-1.53 3.61-1.53 2.89 0 4.88 2.06 4.88 2.06-.06.03-2.86 1.69-2.86 4.97 0 3.78 3.14 5.25 3.19 5.28-.03.08-.47 1.61-1.55 3.08-.97 1.34-1.98 2.67-3.63 2.67M12.92 3.1c.47-.56.81-1.28.81-1.97 0-.08 0-.17-.03-.25-.75.03-1.67.5-2.22 1.14-.5.53-.94 1.39-.94 2.25 0 .08.03.17.03.17.84.08 1.84-.75 2.36-1.33" />
                        </svg>
                    </Link>
                    <Link href="/" className="text-lg font-semibold tracking-tight text-white hover:text-white/90 transition-colors">
                        AirPods Max
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-10 text-xs font-medium tracking-wide">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={cn(
                                "transition-colors duration-300 relative group",
                                pathname === link.href ? "text-white" : "text-neutral-400 hover:text-white"
                            )}
                        >
                            {link.name}
                            {pathname === link.href && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className="absolute -bottom-1 left-0 w-full h-[1px] bg-white rounded-full"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </Link>
                    ))}

                    {/* Auth State UI */}
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-neutral-400 truncate max-w-[150px]">{user.email}</span>
                            <button onClick={handleLogout} className="text-white hover:text-white/70 transition-colors">
                                Sign Out
                            </button>
                            <Link href="/buy" className="bg-white text-black px-5 py-1.5 rounded-full font-semibold hover:scale-105 transition-transform duration-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                Buy
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link href="/login" className="text-neutral-400 hover:text-white transition-colors">
                                Sign In
                            </Link>
                            <Link href="/buy" className="bg-white text-black px-5 py-1.5 rounded-full font-semibold hover:scale-105 transition-transform duration-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                Buy
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden z-50">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-white focus:outline-none"
                    >
                        <div className={cn("w-6 h-0.5 bg-white mb-1.5 transition-all duration-300", isMobileMenuOpen && "rotate-45 translate-y-2")} />
                        <div className={cn("w-6 h-0.5 bg-white transition-all duration-300", isMobileMenuOpen && "opacity-0")} />
                        <div className={cn("w-6 h-0.5 bg-white mt-1.5 transition-all duration-300", isMobileMenuOpen && "-rotate-45 -translate-y-2")} />
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-black/95 backdrop-blur-3xl pt-24 px-6 md:hidden"
                    >
                        <div className="flex flex-col gap-6 text-2xl font-semibold text-white/90">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn("border-b border-white/10 pb-4", pathname === link.href ? "text-white" : "text-neutral-500")}
                                >
                                    {link.name}
                                </Link>
                            ))}

                            {/* Mobile Auth UI */}
                            {user ? (
                                <>
                                    <div className="text-sm text-neutral-400 border-b border-white/10 pb-4">{user.email}</div>
                                    <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-left text-neutral-400 hover:text-white border-b border-white/10 pb-4">
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-neutral-500 hover:text-white border-b border-white/10 pb-4"
                                >
                                    Sign In
                                </Link>
                            )}

                            <Link
                                href="/buy"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="inline-block bg-white text-black px-6 py-3 rounded-full text-center mt-4"
                            >
                                Buy AirPods Max
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
