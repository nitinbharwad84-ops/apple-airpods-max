"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface ReAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    email: string;
}

export default function ReAuthModal({ isOpen, onClose, onSuccess, email }: ReAuthModalProps) {
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"password" | "otp">("password");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const modalRef = useRef<HTMLDivElement>(null);

    // Initial focus and reset
    useEffect(() => {
        if (isOpen) {
            setStep("password");
            setPassword("");
            setOtp("");
            setError("");
        }
    }, [isOpen]);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // Re-authenticate with password
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) throw signInError;

            // If success, send OTP for 2nd factor
            const { error: otpError } = await supabase.auth.signInWithOtp({
                email,
                options: { shouldCreateUser: false }
            });

            if (otpError) throw otpError;

            setStep("otp");
        } catch (err: any) {
            setError(err.message || "Authentication failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const { error: verifyError } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: "email", // or magiclink/sms depending on setup, generic email otp usually works with `email` or `magiclink` type. Sticky here.
            });

            if (verifyError) throw verifyError;

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Invalid code");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
                <div ref={modalRef} className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative overflow-hidden">
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <h3 className="text-lg font-semibold text-white mb-2">Security Check</h3>
                    <p className="text-sm text-neutral-400 mb-6">
                        {step === "password" ? "Please enter your password to continue." : `Enter the code sent to ${email}`}
                    </p>

                    {error && (
                        <div className="mb-4 bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-200 text-xs text-center">
                            {error}
                        </div>
                    )}

                    {step === "password" ? (
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                placeholder="Current Password"
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
                            >
                                {isLoading ? "Verifying..." : "Next"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleOtpSubmit} className="space-y-4">
                            <input
                                type="text"
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-center tracking-widest text-lg focus:border-blue-500 focus:outline-none transition-colors"
                                placeholder="• • • • • •"
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
                            >
                                {isLoading ? "Verifying..." : "Confirm"}
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
