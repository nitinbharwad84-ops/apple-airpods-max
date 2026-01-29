"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import ParallaxImage from "@/components/ParallaxImage";
import H1Chip from "./H1Chip";
import NoiseControlDemo from "./NoiseControlDemo";

export default function DeepDiveSection() {
    return (
        <section id="deep-dive" className="relative z-10 bg-black text-white py-32 px-6 md:px-12 overflow-hidden">
            <div className="max-w-screen-xl mx-auto space-y-48">

                {/* Feature 1: Computational Audio */}
                <div className="relative bg-neutral-900/40 rounded-[3rem] overflow-hidden border border-white/5 p-8 md:p-20">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className="space-y-8"
                        >
                            <div>
                                <h3 className="text-cyan-400 font-semibold text-xl mb-4 tracking-wide uppercase">Computational Audio</h3>
                                <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
                                    Performance caused <br /> by
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"> chips.</span>
                                </h2>
                            </div>

                            <p className="text-xl text-white/80 leading-relaxed font-medium">
                                With a powerful Apple H1 chip in each cup, our custom acoustic design, and advanced software, AirPods Max use computational audio to create a breakthrough listening experience.
                            </p>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-sm">
                                    <span className="block text-3xl font-bold text-white mb-1">10</span>
                                    <span className="text-xs uppercase tracking-widest text-white/50">Audio Cores</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-sm">
                                    <span className="block text-3xl font-bold text-white mb-1">9B</span>
                                    <span className="text-xs uppercase tracking-widest text-white/50">Ops/Sec</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl group bg-black"
                        >
                            <ParallaxImage src="/h1-audio-art.jpg" alt="Apple H1 Chip Computational Audio" className="w-full h-full object-cover scale-110 group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent mix-blend-overlay" />
                        </motion.div>
                    </div>
                </div>

                {/* Feature 2: Digital Crown */}
                <div className="relative bg-neutral-900/40 rounded-[3rem] overflow-hidden border border-white/5 p-8 md:p-20">
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 blur-[150px] rounded-full pointer-events-none" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="order-2 md:order-1 relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl group"
                        >
                            <ParallaxImage src="/digital-crown-luxury.jpg" alt="Digital Crown Interaction" className="w-full h-full object-cover scale-110 group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/40" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className="order-1 md:order-2 space-y-8"
                        >
                            <div>
                                <h3 className="text-neutral-400 font-semibold text-xl mb-4 tracking-wide uppercase">Digital Crown</h3>
                                <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
                                    Detailed <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-500">control.</span>
                                </h2>
                            </div>

                            <p className="text-xl text-white/80 leading-relaxed font-medium">
                                The Digital Crown lets you precisely control volume, skip between tracks, answer phone calls, and activate Siri.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <span className="px-6 py-3 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-sm font-medium tracking-wide">Volume</span>
                                <span className="px-6 py-3 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-sm font-medium tracking-wide">Tracks</span>
                                <span className="px-6 py-3 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-sm font-medium tracking-wide">Calls</span>
                                <span className="px-6 py-3 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-sm font-medium tracking-wide">Siri</span>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Feature 3: The Canopy (New Content) */}
                <div className="relative bg-neutral-900/40 rounded-[3rem] overflow-hidden border border-white/5 p-8 md:p-20">
                    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-500/10 blur-[150px] rounded-full pointer-events-none" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl group"
                        >
                            <ParallaxImage src="/canopy-premium.jpg" alt="Breathable Knit Mesh Canopy" className="w-full h-full object-cover scale-110 group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className="space-y-8"
                        >
                            <div>
                                <h3 className="text-orange-300 font-semibold text-xl mb-4 tracking-wide uppercase">Designed for Comfort</h3>
                                <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
                                    A canopy of <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-200 to-orange-400">comfort.</span>
                                </h2>
                            </div>

                            <p className="text-xl text-white/80 leading-relaxed font-medium">
                                The breathable knit mesh canopy, spanning the headband, is made to distribute weight and reduce on‑head pressure.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                                    </div>
                                    <p className="text-white/70 font-medium">Distributes weight evenly</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                                    </div>
                                    <p className="text-white/70 font-medium">Reduces on-head pressure</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Feature 4: Magical Experience (New Content) */}
                {/* Feature 4: Magical Experience (New Content) */}
                <div className="relative bg-neutral-900/40 rounded-[3rem] overflow-hidden border border-white/5 p-8 md:p-20">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pink-500/10 blur-[150px] rounded-full pointer-events-none" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="order-2 md:order-1 relative aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl group"
                        >
                            <ParallaxImage src="/wireless-magic.jpg" alt="Magical Connection" className="w-full h-full object-cover scale-110 group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className="order-1 md:order-2 space-y-8"
                        >
                            <div>
                                <h3 className="text-pink-400 font-semibold text-xl mb-4 tracking-wide uppercase">Wireless Connectivity</h3>
                                <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
                                    Sounds like <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">magic.</span>
                                </h2>
                            </div>

                            <ul className="space-y-6 text-lg text-white/80 leading-relaxed font-medium">
                                <li className="flex items-start gap-6 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 backdrop-blur-sm">
                                    <span className="text-pink-400 text-2xl mt-1">●</span>
                                    <div>
                                        <div className="text-white font-bold mb-1">One-tap setup</div>
                                        <div className="text-white/60 text-sm">Connects instantly to your iPhone or iPad.</div>
                                    </div>
                                </li>
                                <li className="flex items-start gap-6 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 backdrop-blur-sm">
                                    <span className="text-pink-400 text-2xl mt-1">●</span>
                                    <div>
                                        <div className="text-white font-bold mb-1">Seamless switching</div>
                                        <div className="text-white/60 text-sm">Moves audio between your iPhone, iPad, and Mac.</div>
                                    </div>
                                </li>
                                <li className="flex items-start gap-6 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 backdrop-blur-sm">
                                    <span className="text-pink-400 text-2xl mt-1">●</span>
                                    <div>
                                        <div className="text-white font-bold mb-1">Audio Sharing</div>
                                        <div className="text-white/60 text-sm">Share a stream between two sets of AirPods.</div>
                                    </div>
                                </li>
                            </ul>
                        </motion.div>
                    </div>
                </div>

                {/* Feature 5: Smart Case */}
                {/* Feature 5: Smart Case & Battery */}
                {/* Feature 5: Smart Case & Battery */}
                <div className="mt-32 relative bg-neutral-900/40 rounded-[3rem] p-8 md:p-20 overflow-hidden border border-white/5">
                    {/* Background Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/10 blur-[150px] rounded-full pointer-events-none" />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="space-y-8"
                        >
                            <div>
                                <h3 className="text-green-400 font-semibold text-xl mb-4 tracking-wide uppercase">Power & Efficiency</h3>
                                <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
                                    A case with <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">staying power.</span>
                                </h2>
                            </div>

                            <p className="text-xl text-white/80 leading-relaxed font-medium">
                                When stored in their soft, slim Smart Case, AirPods Max enter an ultra‑low‑power state that preserves charge.
                            </p>

                            <div className="grid grid-cols-2 gap-6">
                                {/* Stat Card 1 */}
                                <div className="p-6 rounded-3xl bg-black/40 border border-white/5 backdrop-blur-md relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition-colors duration-500" />
                                    <div className="relative z-10">
                                        <div className="text-5xl font-bold text-white mb-2 tracking-tighter">20<span className="text-2xl text-green-400 ml-1">hrs</span></div>
                                        <div className="text-sm font-medium text-white/60 leading-snug">Listening, movie watching, or talk time</div>
                                    </div>
                                </div>
                                {/* Stat Card 2 */}
                                <div className="p-6 rounded-3xl bg-black/40 border border-white/5 backdrop-blur-md relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition-colors duration-500" />
                                    <div className="relative z-10">
                                        <div className="text-5xl font-bold text-white mb-2 tracking-tighter">1.5<span className="text-2xl text-green-400 ml-1">hrs</span></div>
                                        <div className="text-sm font-medium text-white/60 leading-snug">Listening time from a 5-minute charge</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, rotate: 5 }}
                            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, type: "spring", bounce: 0.2 }}
                            className="relative aspect-square md:aspect-[4/5] w-full"
                        >
                            <div className="absolute inset-0 rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
                                <ParallaxImage src="/smart-case.jpg" alt="AirPods Max Smart Case" className="w-full h-full object-cover scale-110 group-hover:scale-105 transition-transform duration-700 brightness-75 contrast-125 group-hover:brightness-100 group-hover:contrast-100" />
                                <div className="absolute inset-0 bg-gradient-to-tr from-green-900/20 to-transparent mix-blend-overlay" />
                            </div>
                        </motion.div>
                    </div>
                </div>

            </div>
        </section>
    );
}
