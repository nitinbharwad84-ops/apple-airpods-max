"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function NoiseControlDemo() {
    const [mode, setMode] = useState<"anc" | "transparency">("anc");

    return (
        <div className="flex flex-col items-center justify-center gap-8 w-full group cursor-pointer" onClick={() => setMode(mode === "anc" ? "transparency" : "anc")}>

            {/* Toggle Container */}
            <div className="relative w-56 h-24 bg-black/40 rounded-full border border-white/10 shadow-[inner_0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md overflow-hidden flex items-center p-2">

                {/* Active Glow Background */}
                <motion.div
                    animate={{
                        background: mode === "anc"
                            ? "linear-gradient(90deg, rgba(59,130,246,0.3) 0%, rgba(0,0,0,0) 100%)"
                            : "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(249,115,22,0.3) 100%)"
                    }}
                    className="absolute inset-0 z-0"
                />

                {/* Sliding Knob */}
                <motion.div
                    animate={{ x: mode === "anc" ? 0 : 128 }}
                    transition={{ type: "spring", stiffness: 250, damping: 25 }}
                    className="w-20 h-20 bg-gradient-to-b from-neutral-700 to-neutral-800 rounded-full border border-white/10 shadow-[0_4px_10px_rgba(0,0,0,0.5)] relative z-10 flex items-center justify-center group-hover:border-white/30 transition-colors"
                >
                    {/* Inner Indent */}
                    <div className="w-6 h-10 rounded-full bg-neutral-900/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] border-b border-white/5" />

                    {/* Status Light */}
                    <motion.div
                        animate={{ backgroundColor: mode === "anc" ? "#3b82f6" : "#f97316" }}
                        className="absolute w-1 h-1 rounded-full bottom-3 shadow-[0_0_6px_currentColor]"
                    />
                </motion.div>

                {/* Icons / Labels inside track */}
                <div className="absolute inset-0 flex justify-between px-6 items-center pointer-events-none z-0">
                    <span className={`text-[0.6rem] font-bold tracking-widest uppercase transition-colors duration-500 ${mode === "anc" ? "text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" : "text-white/20"}`}>ANC</span>
                    <span className={`text-[0.6rem] font-bold tracking-widest uppercase transition-colors duration-500 ${mode === "transparency" ? "text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" : "text-white/20"}`}>Trans</span>
                </div>

            </div>

            {/* Text Description */}
            <div className="text-center h-16">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mode}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <h3 className={`font-semibold text-2xl mb-2 ${mode === "anc" ? "text-blue-400" : "text-orange-400"}`}>
                            {mode === "anc" ? "Active Noise Cancellation" : "Transparency Mode"}
                        </h3>
                        <p className="text-white/60 text-lg font-light">
                            {mode === "anc" ? "Blocks external noise." : "Lets outside sound in."}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
