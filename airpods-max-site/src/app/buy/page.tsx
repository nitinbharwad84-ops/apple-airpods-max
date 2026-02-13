"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Image from "next/image";

const colors = [
    { name: "Space Gray", value: "#5e5e63", image: "/products/airpods-max-select.png", filter: "brightness(0.4)" },
    { name: "Silver", value: "#e3e4e5", image: "/products/airpods-max-select.png", filter: "none" },
    { name: "Sky Blue", value: "#a4c4d6", image: "/products/airpods-max-select.png", filter: "sepia(1) saturate(2) hue-rotate(170deg) brightness(0.9) contrast(0.9)" },
    { name: "Pink", value: "#eeb3b6", image: "/products/airpods-max-select.png", filter: "sepia(1) saturate(1.5) hue-rotate(320deg) brightness(0.9) contrast(0.9)" },
    { name: "Green", value: "#a9cbad", image: "/products/airpods-max-select.png", filter: "sepia(1) saturate(1.5) hue-rotate(80deg) brightness(0.9) contrast(0.9)" },
];

export default function BuyPage() {
    const router = useRouter();
    const [selectedColor, setSelectedColor] = useState(colors[0]);
    const [isLoading, setIsLoading] = useState(false);

    const handleAddToBag = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const bagUrl = `/bag?color=${encodeURIComponent(selectedColor.name)}`;

            if (user) {
                // User is logged in, proceed to bag
                router.push(bagUrl);
            } else {
                // User is not logged in, redirect to login
                router.push(`/login?next=${encodeURIComponent(bagUrl)}`);
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            // Fallback to login
            router.push(`/login?next=${encodeURIComponent(`/bag?color=${encodeURIComponent(selectedColor.name)}`)}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-black text-white selection:bg-apple-blue selection:text-white pt-24">
            <NavBar />

            <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20 lg:py-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

                    {/* Left Column: Product Image (Sticky) */}
                    <div className="relative h-[50vh] lg:h-[70vh] w-full flex items-center justify-center lg:sticky lg:top-32">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedColor.name}
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 1.05, y: -20 }}
                                transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                                className="relative w-full h-full"
                            >
                                {/* Glow based on color */}
                                <div
                                    className="absolute inset-0 opacity-30 blur-[100px] transition-colors duration-700"
                                    style={{ backgroundColor: selectedColor.value }}
                                />
                                <Image
                                    src={selectedColor.image}
                                    alt={`AirPods Max - ${selectedColor.name}`}
                                    fill
                                    className="object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-10"
                                    style={{ filter: selectedColor.filter }}
                                    priority
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Right Column: Configuration */}
                    <div className="space-y-12">
                        {/* Header */}
                        <div className="space-y-4 border-b border-white/10 pb-12">
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-orange-500 font-medium tracking-wide uppercase text-xs"
                            >
                                New
                            </motion.span>
                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-5xl md:text-7xl font-semibold tracking-tight"
                            >
                                Buy AirPods Max.
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-3xl text-white/50 font-light"
                            >
                                $549.00
                            </motion.p>
                        </div>

                        {/* Color Selection */}
                        <div className="space-y-6">
                            <h2 className="text-lg font-medium text-white/90">Choose your finish.</h2>
                            <div className="flex flex-wrap gap-4">
                                {colors.map((color) => (
                                    <button
                                        key={color.name}
                                        onClick={() => setSelectedColor(color)}
                                        className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${selectedColor.name === color.name ? "ring-2 ring-white ring-offset-4 ring-offset-black scale-110" : "hover:scale-105"}`}
                                        aria-label={`Select ${color.name}`}
                                    >
                                        <span
                                            className="w-full h-full rounded-full border border-white/10 shadow-inner"
                                            style={{ backgroundColor: color.value }}
                                        />
                                        {/* Tooltip */}
                                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-white bg-neutral-900 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
                                            {color.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <p className="text-white/60 text-sm font-light">
                                <span className="text-white">Selected:</span> {selectedColor.name}
                            </p>
                        </div>

                        {/* Engraving Option */}
                        <div className="bg-neutral-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex items-start justify-between gap-4 cursor-pointer hover:bg-neutral-900/60 transition-colors">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-white font-medium">Add Engraving</span>
                                    <span className="text-xs bg-white/10 text-white/60 px-1.5 py-0.5 rounded">Free</span>
                                </div>
                                <p className="text-sm text-white/50 font-light line-clamp-2">
                                    Personalize them with your initials, memoji, and more.
                                </p>
                            </div>
                            <div className="text-apple-blue text-2xl h-8 w-8 flex items-center justify-center rounded-full border border-apple-blue/30">
                                +
                            </div>
                        </div>

                        {/* Add to Bag */}
                        <div className="pt-8 border-t border-white/10 space-y-6">
                            <div className="flex flex-col gap-4">
                                <h3 className="text-xl font-semibold">Delivery and Pickup</h3>
                                <div className="space-y-3 text-sm text-white/60">
                                    <div className="flex gap-3">
                                        <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        <p><strong className="text-white">Free delivery</strong> <br /> Get it by tomorrow</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                        <p><strong className="text-white">Pickup</strong> <br /> Check availability</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    onClick={handleAddToBag}
                                    disabled={isLoading}
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-xl transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(37,99,235,0.3)] text-center flex items-center justify-center disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    {isLoading ? "Checking..." : "Add to Bag"}
                                </button>
                                <button className="px-4 py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
