"use client";

import { motion } from "framer-motion";

export default function H1Chip() {
    return (
        <div className="relative w-full h-full flex items-center justify-center group pointer-events-none select-none">
            {/* Ambient Chip Glow */}
            <div className="absolute w-40 h-40 bg-blue-500/20 blur-[60px] group-hover:bg-blue-400/30 transition-all duration-1000" />

            {/* Main Chip Body */}
            <motion.div
                initial={{ rotateX: 10, rotateY: -10 }}
                whileInView={{ rotateX: 0, rotateY: 0 }}
                transition={{ duration: 1.5, type: "spring" }}
                className="relative w-52 h-52 bg-[#1a1a1a] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center overflow-hidden border border-neutral-800"
            >
                {/* Brushed Metal Texture Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/50 via-neutral-900 to-black pointer-events-none" />

                {/* Circuit Traces (Etched Look) */}
                <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 200 200">
                    <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    <path d="M40 20 V 180 M 160 20 V 180 M 20 40 H 180 M 20 160 H 180" stroke="white" strokeWidth="0.5" fill="none" />
                </svg>

                {/* Inner Die */}
                <div className="relative z-10 w-32 h-32 bg-black rounded-lg border border-neutral-800 flex flex-col items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,1)]">
                    {/* Apple Logo */}
                    <svg className="w-10 h-10 text-neutral-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-2" viewBox="0 0 384 512" fill="currentColor">
                        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" />
                    </svg>
                    {/* H1 Text */}
                    <h3 className="text-4xl font-sans font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-400 tracking-wider">H1</h3>

                    {/* Reflection Sheen */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                </div>

                {/* Corner Pins (Gold-ish) */}
                <div className="absolute top-3 left-3 w-1.5 h-1.5 bg-yellow-600/50 rounded-full shadow-[0_0_5px_rgba(202,138,4,0.4)]" />
                <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-yellow-600/50 rounded-full shadow-[0_0_5px_rgba(202,138,4,0.4)]" />
                <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-yellow-600/50 rounded-full shadow-[0_0_5px_rgba(202,138,4,0.4)]" />
                <div className="absolute bottom-3 right-3 w-1.5 h-1.5 bg-yellow-600/50 rounded-full shadow-[0_0_5px_rgba(202,138,4,0.4)]" />
            </motion.div>
        </div>
    );
}
