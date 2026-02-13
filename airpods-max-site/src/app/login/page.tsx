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
    const [error, setError] = useState("");

    useEffect(() => {
        // Check if user is already logged in or comes back from Magic Link
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // If user is logged in, we assume they verified successfully.
                // We move to the password creation step to fulfill the requirement.
                // In a real app, you might check if they already have a password set,
                // but for this flow we'll offer to set/reset it.
                setStep("password");
            }
        };
        checkUser();

        // Listen for auth changes (e.g. clicking Magic Link in another tab, or same tab redirect)
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_IN" && session) {
                setStep("password");
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: true,
                    // If they click the link, ensure they come back here to finish the flow
                    emailRedirectTo: typeof window !== 'undefined' ? window.location.href : undefined,
                },
            });

            if (error) throw error;
            setStep("otp");
        } catch (err: any) {
            console.error("Error sending OTP:", err);
            const msg = (err.message || "").toLowerCase();
            if (msg.includes("rate limit") || msg.includes("too many requests")) {
                setError("Rate limit exceeded. Please wait a moment, check your spam for existing links, or try a different email (e.g. yourname+test@gmail.com).");
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
            <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
                <div className="text-center mb-8">
                    <svg className="w-12 h-12 text-white mx-auto mb-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.5,12A5.5,5.5,0,0,1,12,17.5A5.5,5.5,0,0,1,6.5,12A5.5,5.5,0,0,1,12,6.5A5.5,5.5,0,0,1,17.5,12M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Z" />
                    </svg>
                    <h1 className="text-3xl font-semibold mb-2">
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
                                {isLoading ? "Sending..." : "Continue"}
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
                                    placeholder="6-Digit Code"
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
        <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
            <Link href="/" className="absolute top-8 left-8 text-white/50 hover:text-white transition-colors">
                ← Back to Store
            </Link>
            <Suspense fallback={<div className="text-white/50">Loading login...</div>}>
                <LoginForm />
            </Suspense>
        </main>
    );
}
