"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const nextUrl = searchParams.get("next") || "/";

    const [step, setStep] = useState<"email" | "otp" | "password">("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | React.ReactNode>("");

    useEffect(() => {
        // Check if user is already logged in or comes back from Magic Link
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // If user is logged in:
                // 1. If they have a 'code' in URL, it means they just clicked a Magic Link -> Set Password.
                // 2. Otherwise, they are just returning -> Redirect to Store (don't force password reset).
                const hasCode = searchParams?.get("code");
                if (hasCode) {
                    setStep("password");
                } else {
                    router.replace(nextUrl);
                }
            }
        };
        checkUser();

        // Listen for auth changes (e.g. clicking Magic Link in another tab, or same tab redirect)
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_IN" && session) {
                // If sign in happens via event (e.g. implicit flow or cross-tab), check if we should prompt
                // For simplicity, we default to password step if it's an explicit SIGN_IN event
                // but we rely on the checkUser for the initial load redirect.
                // We keep this just in case, but the redirect above is the primary fix.
                if (searchParams?.get("code")) {
                    setStep("password");
                }
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [searchParams, router, nextUrl]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: true,
                },
            });

            if (error) throw error;
            setStep("otp");
        } catch (err: any) {
            console.error("Error sending OTP:", err);
            const msg = (err.message || "").toLowerCase();
            if (msg.includes("rate limit") || msg.includes("too many requests")) {
                setError(
                    <span>
                        Rate limit hit.{" "}
                        <button
                            onClick={() => {
                                const alias = email.split('@')[0] + "+test" + Math.floor(Math.random() * 1000) + "@" + email.split('@')[1];
                                setEmail(alias);
                                setTimeout(() => document.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })), 100);
                            }}
                            className="underline text-white font-bold hover:text-blue-400"
                        >
                            Click here to try with a test alias
                        </button>
                        {" "}to bypass it instantly.
                    </span> as any
                );
            } else {
                setError(err.message || "Failed to submit email.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: "email",
            });

            if (error) throw error;
            setStep("password");
        } catch (err: any) {
            console.error("Error verifying OTP:", err);
            setError(err.message || "Invalid verification code.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) throw error;

            // Success! Redirect.
            router.push(nextUrl);
        } catch (err: any) {
            console.error("Error setting password:", err);
            setError(err.message || "Failed to set password.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
        >
            <div className="bg-neutral-900 border border-white/10 rounded-3xl p-6 md:p-12 shadow-2xl w-full">
                <div className="text-center mb-8">
                    <svg className="w-12 h-12 text-white mx-auto mb-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.5,12A5.5,5.5,0,0,1,12,17.5A5.5,5.5,0,0,1,6.5,12A5.5,5.5,0,0,1,12,6.5A5.5,5.5,0,0,1,17.5,12M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Z" />
                    </svg>
                    <h1 className="text-2xl md:text-3xl font-semibold mb-2">
                        {step === "email" && "Sign In or Sign Up"}
                        {step === "otp" && "Verify Email"}
                        {step === "password" && "Create Password"}
                    </h1>
                    <p className="text-white/60 text-sm">
                        {step === "email" && "Enter your email to continue."}
                        {step === "otp" && (
                            <span>
                                We sent a magic link to <span className="text-white">{email}</span>.
                                <br /> <span className="text-blue-400">Click the link in the email</span> or enter the code if provided.
                            </span>
                        )}
                        {step === "password" && "Secure your account with a password."}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {step === "email" && (
                        <motion.form
                            key="email-form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleSendOtp}
                            className="space-y-6"
                        >
                            <div>
                                <input
                                    type="email"
                                    required
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50"
                            >
                                {isLoading ? "Sending..." : "Send Verification Code"}
                            </button>
                        </motion.form>
                    )}

                    {step === "otp" && (
                        <motion.form
                            key="otp-form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleVerifyOtp}
                            className="space-y-6"
                        >
                            <div>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter 8-Digit Code"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 text-center tracking-widest text-lg transition-colors"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50"
                            >
                                {isLoading ? "Verifying..." : "Verify Code"}
                            </button>
                            <div className="flex justify-between text-sm">
                                <button
                                    type="button"
                                    onClick={() => setStep("email")}
                                    className="text-white/40 hover:text-white transition-colors"
                                >
                                    Change Email
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={isLoading}
                                    className="text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                                >
                                    Resend Code
                                </button>
                            </div>
                        </motion.form>
                    )}

                    {step === "password" && (
                        <motion.form
                            key="password-form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleSetPassword}
                            className="space-y-6"
                        >
                            <div>
                                <input
                                    type="password"
                                    required
                                    placeholder="Create Password"
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50"
                            >
                                {isLoading ? "Saving..." : "Create Account"}
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>

                {error && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-400 text-sm text-center mt-6"
                    >
                        {error}
                    </motion.p>
                )}
            </div>
        </motion.div>
    );
}

export default function LoginPage() {
    return (
        <main className="min-h-[100dvh] bg-black text-white flex flex-col relative overflow-y-auto selection:bg-blue-500/30">
            <div className="absolute top-6 left-6 md:top-8 md:left-8 z-20">
                <Link href="/" className="text-sm md:text-base text-white/50 hover:text-white transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Store
                </Link>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-4 py-20 md:p-6 w-full">
                <Suspense fallback={<div className="text-white/50 animate-pulse">Loading login...</div>}>
                    <LoginForm />
                </Suspense>
            </div>
        </main>
    );
}
