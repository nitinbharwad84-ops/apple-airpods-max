"use client";

import { useRef, useState, useMemo } from "react";
import { useScroll, useTransform, useMotionValueEvent, motion } from "framer-motion";
import Link from "next/link";
import ProductCanvas from "./ProductCanvas";
import { RevealText } from "@/components/RevealText";
import { cn } from "@/lib/utils";

// Total frames in the sequence
const FRAME_COUNT = 210;
// Total scroll height (vh)
const SCROLL_HEIGHT = 600;

export default function Scrollytelling() {
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Map 0-1 scroll progress to 0-(FRAME_COUNT-1)
    const frameIndex = useTransform(scrollYProgress, [0, 1], [0, FRAME_COUNT - 1]);

    // We need integer frame index for the canvas
    const [currentFrame, setCurrentFrame] = useState(0);

    useMotionValueEvent(frameIndex, "change", (latest) => {
        setCurrentFrame(Math.round(latest));
    });

    return (
        <div
            ref={containerRef}
            className="relative w-full bg-black"
            style={{ height: `${SCROLL_HEIGHT}vh` }}
        >
            {/* Sticky Viewport */}
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                <ProductCanvas currentFrame={currentFrame} frameCount={FRAME_COUNT} />

                {/* Overlays Container */}
                <div className="absolute inset-0 pointer-events-none z-20">
                    {/* Vignette for text readability */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />

                    {/* Section 1: Intro */}
                    <SectionOverlay progress={scrollYProgress} start={0} end={0.15} align="center">
                        <div className="relative z-10">
                            <RevealText>
                                <h1 className="text-8xl md:text-[10rem] font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-8 drop-shadow-2xl">
                                    AirPods Max
                                </h1>
                            </RevealText>
                            <RevealText>
                                <p className="text-2xl md:text-4xl font-light text-white/90 tracking-[0.2em] uppercase">
                                    Immersive. Precise. Personal.
                                </p>
                            </RevealText>
                        </div>
                    </SectionOverlay>

                    {/* Section 2: Design */}
                    <SectionOverlay progress={scrollYProgress} start={0.15} end={0.4} align="left">
                        <div className="max-w-2xl p-10 rounded-[2.5rem] backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] transform translate-x-4 md:translate-x-0">
                            <RevealText>
                                <h2 className="text-5xl md:text-7xl font-semibold text-white mb-6 tracking-tight leading-tight">
                                    Crafted from <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-200 to-neutral-500">excellence.</span>
                                </h2>
                            </RevealText>
                            <p className="text-xl md:text-2xl text-white/70 leading-relaxed font-light">
                                An uncompromising fit that creates the optimal acoustic seal for many different head shapes — fully immersing you in every sound.
                            </p>
                        </div>
                    </SectionOverlay>

                    {/* Section 3: Audio Tech */}
                    <SectionOverlay progress={scrollYProgress} start={0.4} end={0.65} align="right">
                        <div className="max-w-2xl text-right ml-auto p-10 rounded-[2.5rem] backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] transform -translate-x-4 md:translate-x-0">
                            <RevealText>
                                <h2 className="text-5xl md:text-7xl font-semibold text-white mb-8 tracking-tight leading-tight">
                                    Silence, <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-blue-500">reimagined.</span>
                                </h2>
                            </RevealText>
                            <ul className="space-y-6 text-xl md:text-2xl text-white/80 font-light inline-block text-left">
                                <li className="flex items-center gap-4">
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
                                    Industry-leading Active Noise Cancellation.
                                </li>
                                <li className="flex items-center gap-4">
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
                                    Transparency mode for hearing the world.
                                </li>
                                <li className="flex items-center gap-4">
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
                                    Spatial Audio with dynamic head tracking.
                                </li>
                            </ul>
                        </div>
                    </SectionOverlay>

                    {/* Section 4: Experience */}
                    <SectionOverlay progress={scrollYProgress} start={0.65} end={0.85} align="left">
                        <div className="max-w-2xl p-10 rounded-[2.5rem] backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                            <RevealText>
                                <h2 className="text-5xl md:text-7xl font-semibold text-white mb-6 tracking-tight leading-tight">
                                    Sound that <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-purple-400">feels alive.</span>
                                </h2>
                            </RevealText>
                            <div className="space-y-6 text-xl md:text-2xl text-white/70 font-light">
                                <p className="leading-relaxed">
                                    Adaptive EQ automatically key tunes music to the shape of your ear.
                                </p>
                                <p className="leading-relaxed">
                                    Rich, deep bass. Accurate mids. Crisp, clean highs.
                                </p>
                            </div>
                        </div>
                    </SectionOverlay>

                    {/* Section 5: CTA */}
                    <SectionOverlay progress={scrollYProgress} start={0.85} end={1.0} align="center">
                        <div className="text-center p-16 rounded-[4rem] bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_0_100px_rgba(255,255,255,0.1)] max-w-4xl mx-auto">
                            <RevealText>
                                <h2 className="text-7xl md:text-9xl font-bold text-white mb-10 tracking-tighter leading-none">
                                    Hear brilliance.
                                </h2>
                            </RevealText>
                            <div className="flex flex-col md:flex-row gap-8 justify-center items-center mt-12 pointer-events-auto">
                                <Link href="#deep-dive">
                                    <button className="group relative bg-white text-black pl-10 pr-12 py-5 rounded-full font-semibold text-xl hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] overflow-hidden">
                                        <span className="relative z-10 flex items-center gap-2">
                                            Experience Now
                                            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                        </span>
                                    </button>
                                </Link>
                                <Link href="/product-details">
                                    <button className="text-neutral-400 font-medium text-lg hover:text-white transition-colors tracking-wide border-b border-transparent hover:border-white pb-1">
                                        View Technical Specs
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </SectionOverlay>
                </div>
            </div>
        </div>
    );
}

// Helper for consistent section fading 

function SectionOverlay({
    progress,
    start,
    end,
    children,
    align = "center"
}: {
    progress: any,
    start: number,
    end: number,
    children: React.ReactNode,
    align?: "left" | "center" | "right"
}) {
    const opacity = useTransform(
        progress,
        [start, start + 0.05, end - 0.05, end],
        [0, 1, 1, 0]
    );

    const y = useTransform(
        progress,
        [start, start + 0.05, end - 0.05, end],
        [50, 0, 0, -50]
    );

    const alignClasses = {
        left: "items-center md:items-start text-left pl-8 md:pl-24",
        center: "items-center justify-center text-center",
        right: "items-center md:items-end text-right pr-8 md:pr-24"
    };

    return (
        <motion.div
            style={{ opacity, y }}
            className={cn(
                "absolute inset-0 flex flex-col justify-center w-full h-full p-8",
                alignClasses[align]
            )}
        >
            {children}
        </motion.div>
    );
}
