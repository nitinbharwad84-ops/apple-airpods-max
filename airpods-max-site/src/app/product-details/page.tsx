import NavBar from "@/components/NavBar";
import { RevealText } from "@/components/RevealText";
import ParallaxImage from "@/components/ParallaxImage";
import NoiseControlDemo from "@/components/NoiseControlDemo";
import H1Chip from "@/components/H1Chip";
import Footer from "@/components/Footer";

export default function ProductDetailsPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-apple-blue selection:text-white pt-32 pb-20 relative overflow-hidden">

            <NavBar />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-32">
                    <RevealText>
                        <h1 className="text-6xl md:text-9xl font-bold mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
                            Technical <br /> Specifications.
                        </h1>
                    </RevealText>
                    <p className="text-white/50 text-xl md:text-2xl font-light tracking-wide max-w-2xl mx-auto">
                        The fine print of perfection.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Card 1: Audio Tech - Large visual */}
                    <div className="md:col-span-2 p-10 rounded-[3rem] bg-neutral-900/40 backdrop-blur-lg border border-white/5 relative overflow-hidden group min-h-[500px] flex flex-col justify-end">
                        {/* Background Image */}
                        <div className="absolute inset-0 opacity-60 group-hover:scale-105 transition-transform duration-1000">
                            <ParallaxImage src="/spatial-audio-tech.jpg" alt="Spatial Audio Technology" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                        <div className="relative z-10">
                            <h2 className="text-4xl font-bold text-white mb-8">Audio Technology</h2>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg text-white/90 font-medium">
                                <li className="flex items-center gap-4 bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors">
                                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></span>
                                    Apple-designed dynamic driver
                                </li>
                                <li className="flex items-center gap-4 bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors">
                                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></span>
                                    Active Noise Cancellation
                                </li>
                                <li className="flex items-center gap-4 bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors">
                                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></span>
                                    Transparency mode
                                </li>
                                <li className="flex items-center gap-4 bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors">
                                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></span>
                                    Spatial Audio with tracking
                                </li>
                                <li className="flex items-center gap-4 bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors">
                                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></span>
                                    Adaptive EQ
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Card 2: Sensors */}
                    <div className="p-10 rounded-[3rem] bg-neutral-900/40 backdrop-blur-lg border border-white/5 relative overflow-hidden group flex flex-col justify-between">
                        <div className="absolute inset-0 opacity-40 group-hover:scale-105 transition-transform duration-700">
                            <ParallaxImage src="/sensors-array.jpg" alt="Sensor Array Blueprint" className="w-full h-full object-cover scale-125" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />

                        <div className="relative z-10 pointer-events-none">
                            {/* Spacer */}
                        </div>

                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold text-white mb-6">Sensors</h2>
                            <ul className="space-y-3 text-sm text-white/70 font-mono tracking-wide">
                                <li className="flex justify-between border-b border-white/10 pb-2"><span>Optical sensor</span> <span className="text-white">x2</span></li>
                                <li className="flex justify-between border-b border-white/10 pb-2"><span>Position sensor</span> <span className="text-white">x2</span></li>
                                <li className="flex justify-between border-b border-white/10 pb-2"><span>Case-detect</span> <span className="text-white">x2</span></li>
                                <li className="flex justify-between border-b border-white/10 pb-2"><span>Accelerometer</span> <span className="text-white">x2</span></li>
                                <li className="flex justify-between border-b border-white/10 pb-2"><span>Gyroscope</span> <span className="text-white">Left</span></li>
                            </ul>
                            <div className="mt-6 text-right">
                                <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/20">9</span>
                                <span className="block text-xs uppercase tracking-widest text-white/40">Total Sensors</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Microphones */}
                    <div className="p-10 rounded-[3rem] bg-neutral-900/40 backdrop-blur-lg border border-white/5 relative overflow-hidden flex flex-col justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">Microphones</h2>
                            <p className="text-white/50 text-sm">Total mics for ANC and voice.</p>
                        </div>

                        <div className="flex items-baseline gap-2 mt-8">
                            <span className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-blue-600/20">9</span>
                        </div>

                        {/* Visual representation */}
                        <div className="relative z-10 h-32 flex items-end justify-between gap-2 opacity-80 mt-8">
                            {[4, 8, 3, 9, 5, 8, 4, 6, 3].map((h, i) => (
                                <div key={i} style={{ height: `${h * 10}%` }} className="w-full bg-gradient-to-t from-blue-500 to-cyan-300 rounded-t-sm opacity-60" />
                            ))}
                        </div>
                    </div>

                    {/* Card 4: Chip - Center Highlight */}
                    <div className="md:col-span-2 p-10 rounded-[3rem] bg-black border border-white/10 flex flex-col md:flex-row items-center justify-between relative overflow-hidden group">
                        <div className="absolute right-0 top-0 h-full w-full md:w-2/3 opacity-20 mix-blend-screen group-hover:opacity-30 transition-opacity duration-1000">
                            <ParallaxImage src="/h1-chip-final.jpg" alt="H1 Chip Context" className="w-full h-full object-cover grayscale" />
                            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black" />
                        </div>

                        <div className="relative z-10 flex flex-col justify-center h-full space-y-4">
                            <h2 className="text-3xl font-bold text-white">Processing Power</h2>
                            <p className="text-white/60 text-lg">Apple H1 Headphone Chip</p>
                            <div className="w-40 h-40 scale-125 origin-left">
                                <H1Chip />
                            </div>
                        </div>

                        <div className="relative z-10 flex flex-row md:flex-col gap-12 md:gap-8 mt-8 md:mt-0 text-right">
                            <div>
                                <span className="block text-5xl font-bold text-white mb-2">10</span>
                                <span className="text-white/40 uppercase tracking-widest text-xs font-medium">Audio Cores</span>
                            </div>
                            <div>
                                <span className="block text-5xl font-bold text-white mb-2">9B</span>
                                <span className="text-white/40 uppercase tracking-widest text-xs font-medium">Ops/Sec</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 5 & 6: Controls & Connectivity */}
                    <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Control 1: Digital Crown */}
                        <div className="p-10 rounded-[3rem] bg-neutral-900/40 border border-white/5 backdrop-blur-lg flex flex-col justify-end min-h-[400px] relative overflow-hidden group">
                            <div className="absolute inset-0 opacity-60 group-hover:scale-105 transition-transform duration-1000">
                                <ParallaxImage src="/digital-crown-cinematic.jpg" alt="Digital Crown Texture" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                            <div className="relative z-10 px-2 pb-2">
                                <h2 className="text-3xl font-bold text-white mb-4">Digital Crown</h2>
                                <p className="text-white/60 mb-6 font-light">
                                    Precise control. Beautifully orchestrated.
                                </p>
                                <ul className="space-y-3 text-white/90 text-sm font-medium">
                                    <li className="flex items-center gap-3 backdrop-blur-md bg-white/5 p-3 rounded-xl border border-white/5">
                                        <span className="text-xs uppercase tracking-widest text-white/50 w-12">Turn</span>
                                        Precise volume control
                                    </li>
                                    <li className="flex items-center gap-3 backdrop-blur-md bg-white/5 p-3 rounded-xl border border-white/5">
                                        <span className="text-xs uppercase tracking-widest text-white/50 w-12">Press</span>
                                        Play / Pause / Answer
                                    </li>
                                    <li className="flex items-center gap-3 backdrop-blur-md bg-white/5 p-3 rounded-xl border border-white/5">
                                        <span className="text-xs uppercase tracking-widest text-white/50 w-12">Hold</span>
                                        Siri Activation
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Control 2: Noise Control */}
                        <div className="p-10 rounded-[3rem] bg-neutral-900/40 border border-white/5 backdrop-blur-lg relative overflow-hidden min-h-[400px] flex flex-col justify-between group">
                            <div className="absolute inset-0 opacity-50 group-hover:scale-105 transition-transform duration-1000 mix-blend-screen">
                                <ParallaxImage src="/noise-control-visual.jpg" alt="Noise Control Visualization" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />

                            <div className="relative z-10">
                                <h2 className="text-3xl font-bold text-white mb-2">Noise Control</h2>
                                <p className="text-white/60 font-light">Immersive sound. Optional silence.</p>
                            </div>

                            <div className="relative z-10 flex flex-col items-center mt-12">
                                <div className="scale-125 mb-8">
                                    <NoiseControlDemo />
                                </div>
                                <p className="text-center text-white/40 text-xs uppercase tracking-widest">
                                    Press to toggle modes
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-3 mt-16">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Headphones Weight Card */}
                            <div className="bg-neutral-900/20 backdrop-blur-md border border-white/5 rounded-3xl p-8 flex items-center justify-between group hover:bg-neutral-900/40 transition-colors duration-500">
                                <div>
                                    <h3 className="text-white/40 uppercase tracking-widest text-xs font-semibold mb-2">Weight</h3>
                                    <p className="text-white font-medium text-lg">AirPods Max</p>
                                    <p className="text-white/30 text-xs mt-1">Including cushions</p>
                                </div>
                                <div className="text-right">
                                    <span className="block text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/20">384.8<span className="text-lg text-white/40 font-light ml-1">g</span></span>
                                    <span className="text-white/30 text-sm font-mono tracking-wide">13.6 oz</span>
                                </div>
                            </div>

                            {/* Smart Case Weight Card */}
                            <div className="bg-neutral-900/20 backdrop-blur-md border border-white/5 rounded-3xl p-8 flex items-center justify-between group hover:bg-neutral-900/40 transition-colors duration-500">
                                <div>
                                    <h3 className="text-white/40 uppercase tracking-widest text-xs font-semibold mb-2">Weight</h3>
                                    <p className="text-white font-medium text-lg">Smart Case</p>
                                    <p className="text-white/30 text-xs mt-1">Ultra-low power state</p>
                                </div>
                                <div className="text-right">
                                    <span className="block text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/20">134.5<span className="text-lg text-white/40 font-light ml-1">g</span></span>
                                    <span className="text-white/30 text-sm font-mono tracking-wide">4.74 oz</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <Footer />
        </main>
    );
}
