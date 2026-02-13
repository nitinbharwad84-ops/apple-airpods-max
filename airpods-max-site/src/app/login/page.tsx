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

    const [authMode, setAuthMode] = useState<"signin" | "signup" | "forgot">("signin");
    const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");

    // Form inputs
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [fullName, setFullName] = useState("");

    // Flow state
    const [step, setStep] = useState<"initial" | "otp" | "password_reset" | "create_password">("initial");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | React.ReactNode>("");

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // If the user lands here with a 'code' in URL, it means they clicked a magic link
                // We determine context based on where they initiated implementation (difficult to track across page reloads without local storage, 
                // but we can default to 'create_password' if they don't have a password set, or just redirect).
                // For this request, we prioritize the "Redirect if logged in" unless they are setting a password.

                // If we are in 'password_reset' or 'create_password' flow triggered by URL code:
                if (window.location.hash.includes('type=recovery') || searchParams?.get("code")) {
                    // logic handled by auth state change usually, but let's be safe
                } else {
                    router.replace(nextUrl);
                }
            }
        };
        checkUser();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === "PASSWORD_RECOVERY") {
                setStep("password_reset");
                setAuthMode("forgot");
            } else if (event === "SIGNED_IN" && session) {
                // If just signed in via magic link for Sign Up
                if (authMode === "signup" && step === "otp") {
                    setStep("create_password");
                }
                // Default redirect for standard login
                else if (authMode === 'signin' && loginMethod === 'password') {
                    router.replace(nextUrl);
                }
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [authMode, step, loginMethod, router, nextUrl, searchParams]);


    // --- Handlers ---

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            if (loginMethod === "password") {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.replace(nextUrl);
            } else {
                // OTP Login (Backup)
                const { error } = await supabase.auth.signInWithOtp({
                    email,
                    options: { shouldCreateUser: false } // Crucial: Don't create new account on login
                });
                if (error) throw error;
                setStep("otp");
            }
        } catch (err: any) {
            console.error("Sign In Error:", err);
            // Custom error messages
            if (err.message.includes("Invalid login credentials")) {
                setError("Incorrect email or password. Please try again.");
            } else if (err.message.includes("Signups not allowed")) {
                setError("Account does not exist. Please Sign Up.");
            } else {
                setError(err.message || "Failed to sign in.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUpStart = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            // We initiate with OTP to verify email first
            // Note: Supabase doesn't easily expose "check if exists" without logging in.
            // But we can try detailed response or edge functions.
            // For now, standard flow:
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: true,
                    data: { full_name: fullName }
                }
            });

            if (error) throw error;
            setStep("otp");
        } catch (err: any) {
            console.error("Sign Up Error:", err);
            let msg = err.message || "Failed to start sign up.";
            if (msg.toLowerCase().includes("rate limit")) {
                setError(
                    <span>
                        Rate limit hit. <button onClick={() => {
                            const alias = email.split('@')[0] + "+test" + Math.floor(Math.random() * 1000) + "@" + email.split('@')[1];
                            setEmail(alias);
                        }} className="underline decoration-blue-400">Try alias</button>
                    </span> as any
                );
            } else {
                setError(msg);
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
            let verifyType: "recovery" | "signup" | "magiclink" = "magiclink";
            if (authMode === "forgot") verifyType = "recovery";
            else if (authMode === "signup") verifyType = "signup";

            const { error } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: verifyType,
            });
            if (error) {
                // Fallback to generic 'email' type if specific fails, often fixes magic link vs otp confusion
                const { error: retryError } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
                if (retryError) throw retryError;
            }

            // Success handling
            if (authMode === "signup") {
                setStep("create_password");
            } else if (authMode === "forgot") {
                setStep("password_reset");
            } else {
                router.replace(nextUrl);
            }
        } catch (err: any) {
            console.error("Verify OTP Error:", err);
            setError("Invalid code. Please check your email and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            router.replace(nextUrl);
        } catch (err: any) {
            setError(err.message || "Failed to update password.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        setError("");
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login?type=recovery` : undefined,
            });
            if (error) throw error;
            setStep("otp"); // User enters the code from email
        } catch (err: any) {
            setError(err.message || "Failed to send reset code.");
        } finally {
            setIsLoading(false);
        }
    }


    // --- Render Helpers ---

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
        >
            <div className="bg-neutral-900 border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl w-full relative overflow-hidden">

                {/* Header / Tabs */}
                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                    <button
                        onClick={() => { setAuthMode("signin"); setStep("initial"); setError(""); }}
                        className={`text-lg font-semibold transition-colors ${authMode === 'signin' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
                    >
                        Sign In
                    </button>
                    <div className="h-4 w-[1px] bg-white/10"></div>
                    <button
                        onClick={() => { setAuthMode("signup"); setStep("initial"); setError(""); }}
                        className={`text-lg font-semibold transition-colors ${authMode === 'signup' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Error Display */}
                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-200 text-sm text-center">
                        {error}
                    </motion.div>
                )}

                {/* --- SIGN IN VIEW --- */}
                {authMode === "signin" && (
                    <div className="space-y-6">
                        {step === "initial" && (
                            <form onSubmit={handleSignIn} className="space-y-4">
                                <div>
                                    <label className="block text-xs text-white/50 mb-1 ml-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                        placeholder="name@example.com"
                                    />
                                </div>

                                {loginMethod === "password" ? (
                                    <div>
                                        <label className="block text-xs text-white/50 mb-1 ml-1">Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                            placeholder="Enter Password"
                                        />
                                        <div className="flex justify-end mt-2">
                                            <button type="button" onClick={() => { setAuthMode("forgot"); setError(""); }} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                                                Forgot Password?
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // OTP Login Hint
                                    <p className="text-sm text-white/60 text-center py-2">We'll send a code to your email.</p>
                                )}

                                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50 mt-4">
                                    {isLoading ? "Loading..." : (loginMethod === "password" ? "Sign In" : "Send Login Code")}
                                </button>

                                <div className="pt-4 text-center border-t border-white/10 mt-6">
                                    <button type="button" onClick={() => setLoginMethod(loginMethod === "password" ? "otp" : "password")} className="text-sm text-white/50 hover:text-white transition-colors">
                                        {loginMethod === "password" ? "Sign in with Code instead" : "Sign in with Password instead"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {step === 'otp' && (
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <p className="text-white/70 text-sm text-center mb-4">Enter the code sent to {email}</p>
                                <input
                                    type="text"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-center tracking-[0.5em] text-xl focus:border-blue-500 focus:outline-none transition-colors"
                                    placeholder="ERROR Check Note"
                                />
                                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50">
                                    {isLoading ? "Verifying..." : "Verify Code"}
                                </button>
                                <button type="button" onClick={() => setStep('initial')} className="w-full text-sm text-white/40 hover:text-white mt-2">Go Back</button>
                            </form>
                        )}
                    </div>
                )}

                {/* --- SIGN UP VIEW --- */}
                {authMode === "signup" && (
                    <div className="space-y-6">
                        {step === "initial" && (
                            <form onSubmit={handleSignUpStart} className="space-y-4">
                                <div>
                                    <label className="block text-xs text-white/50 mb-1 ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-white/50 mb-1 ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-white/50 mb-1 ml-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                        placeholder="name@example.com"
                                    />
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50">
                                    {isLoading ? "Sending..." : "Continue"}
                                </button>
                                <p className="text-xs text-white/30 text-center mt-4">
                                    By clicking Continue, you agree to our Terms.
                                </p>
                            </form>
                        )}

                        {step === "otp" && (
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <p className="text-white/70 text-sm text-center mb-4">Enter the verification code sent to {email}</p>
                                <input
                                    type="text"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-center tracking-[0.5em] text-xl focus:border-blue-500 focus:outline-none transition-colors"
                                    placeholder="------"
                                />
                                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50">
                                    {isLoading ? "Verifying..." : "Verify & Create Account"}
                                </button>
                            </form>
                        )}

                        {step === "create_password" && (
                            <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                <h3 className="text-white text-lg font-medium text-center mb-2">Create your Password</h3>
                                <div>
                                    <label className="block text-xs text-white/50 mb-1 ml-1">New Password</label>
                                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-xs text-white/50 mb-1 ml-1">Confirm Password</label>
                                    <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-colors" />
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50">
                                    {isLoading ? "Saving..." : "Set Password & Login"}
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {/* --- FORGOT PASSWORD VIEW --- */}
                {authMode === "forgot" && (
                    <div className="space-y-6">
                        <div className="text-center mb-4">
                            <h3 className="text-white font-medium">Reset Password</h3>
                        </div>

                        {step === "initial" && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-white/50 mb-1 ml-1">Email</label>
                                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-colors" />
                                </div>
                                <button onClick={handleForgotPassword} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50">
                                    {isLoading ? "Sending..." : "Send Reset Code"}
                                </button>
                                <button onClick={() => setAuthMode('signin')} className="w-full text-sm text-white/40 hover:text-white mt-2">Cancel</button>
                            </div>
                        )}

                        {step === "otp" && (
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <p className="text-white/70 text-sm text-center">Enter code from email to reset password</p>
                                <input type="text" required value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-center tracking-[0.5em] text-xl focus:border-blue-500 transition-colors" />
                                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50">Verify Code</button>
                            </form>
                        )}

                        {(step === "password_reset" || step === "create_password") && (
                            <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                <h3 className="text-white text-sm text-center pb-2">Enter New Password</h3>
                                <div>
                                    <label className="block text-xs text-white/50 mb-1 ml-1">New Password</label>
                                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-xs text-white/50 mb-1 ml-1">Confirm Password</label>
                                    <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-colors" />
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50">
                                    {isLoading ? "Saving..." : "Update Password"}
                                </button>
                            </form>
                        )}
                    </div>
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
