import NavBar from "@/components/NavBar";
import ParallaxImage from "@/components/ParallaxImage";
import { RevealText } from "@/components/RevealText";
import Footer from "@/components/Footer";

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-apple-blue selection:text-white">
            <NavBar />

            {/* Cinematic Hero */}
            {/* Cinematic Hero: Story of Sound */}
            <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 z-0">
                    <ParallaxImage src="/about-hero-premium.jpg" alt="AirPods Max Cinematic Profile" className="w-full h-full object-cover scale-110 opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />
                    <div className="absolute inset-0 bg-radial-at-c from-transparent to-black/80" />
                </div>

                <div className="relative z-10 text-center max-w-5xl px-6 mt-20">
                    <RevealText>
                        <h1 className="text-7xl md:text-[10rem] font-bold tracking-tighter mb-8 leading-[0.9] text-white mix-blend-overlay opacity-90">
                            The Story <br /> of Sound.
                        </h1>
                    </RevealText>
                    <RevealText>
                        <p className="text-2xl md:text-3xl text-white/80 font-light tracking-wide max-w-3xl mx-auto backdrop-blur-sm py-4 rounded-xl">
                            A complete reimagining of the over-ear headphone.
                        </p>
                    </RevealText>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
                    <div className="w-1 h-12 bg-gradient-to-b from-white to-transparent rounded-full" />
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 py-20 space-y-32">
                {/* Story Block 1 */}
                {/* Story Block 1: Radical Composition */}
                <section className="relative bg-neutral-900/40 rounded-[3rem] overflow-hidden border border-white/5 p-8 md:p-20">
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

                    <div className="grid md:grid-cols-2 gap-20 items-center relative z-10">
                        <div className="space-y-10">
                            <RevealText>
                                <h2 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
                                    Radical <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Composition.</span>
                                </h2>
                            </RevealText>
                            <div className="w-24 h-1.5 bg-purple-500/50 rounded-full" />
                            <div className="space-y-6">
                                <p className="text-xl text-white/80 leading-relaxed font-medium">
                                    The stainless steel frame is wrapped with a soft-to-the-touch material for a remarkable combination of strength, flexibility, and comfort.
                                </p>
                                <p className="text-lg text-white/60 leading-relaxed font-light">
                                    Telescoping arms smoothly extend and stay where you set them, for a consistent fit and seal. From the canopy to the cushions, every part of AirPods Max is carefully crafted.
                                </p>
                            </div>
                        </div>

                        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
                            <ParallaxImage src="/telescoping-arm.jpg" alt="Stainless Steel Telescoping Arm" className="w-full h-full scale-110 group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 opacity-60" />
                        </div>
                    </div>
                </section>

                {/* Full Bleed Break */}
                {/* Full Bleed Break: Acoustic Architecture */}
                <section className="relative h-[80vh] rounded-[3rem] overflow-hidden border border-white/10 group">
                    <ParallaxImage src="/acoustic-architecture.jpg" alt="Acoustic Architecture Visualization" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-32">
                        <RevealText>
                            <h2 className="text-6xl md:text-9xl font-bold text-center tracking-tighter drop-shadow-2xl text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                                Acoustic <br /> Architecture.
                            </h2>
                        </RevealText>
                        <p className="mt-6 text-xl text-white/70 max-w-xl text-center font-light tracking-wide">
                            Engineered for pure sound. Validated by science.
                        </p>
                    </div>
                </section>

                {/* Story Block 2 */}
                {/* Story Block 2: Audio Engineering */}
                <section className="relative bg-neutral-900/40 rounded-[3rem] overflow-hidden border border-white/5 p-8 md:p-20">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

                    <div className="grid md:grid-cols-2 gap-20 items-center relative z-10">
                        <div className="order-2 md:order-1 relative aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
                            <ParallaxImage src="/driver-exploded.jpg" alt="Apple-designed Dynamic Driver" className="w-full h-full scale-110 group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                        </div>

                        <div className="space-y-10 order-1 md:order-2">
                            <RevealText>
                                <h2 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Uncompromising</span> <br />
                                    Fidelity.
                                </h2>
                            </RevealText>
                            <div className="w-24 h-1.5 bg-blue-500/50 rounded-full" />
                            <div className="space-y-6">
                                <p className="text-xl text-white/80 leading-relaxed font-medium">
                                    We didn't just want them to look good. We wanted them to sound unlike anything else.
                                </p>
                                <p className="text-lg text-white/60 leading-relaxed font-light">
                                    The Apple-designed dynamic driver provides a wide frequency range that uncovers the rich details of every sound — delivering your favorite songs with previously unheard texture and accuracy.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <section className="relative z-10 py-32 px-6 border-t border-white/5 bg-neutral-900/40 backdrop-blur-lg text-center mt-32">
                <div className="max-w-4xl mx-auto space-y-8">
                    <p className="text-sm font-medium tracking-widest text-white/50 uppercase">Next Chapter</p>
                    <a href="/product-details" className="group inline-flex items-center gap-4 text-5xl md:text-7xl font-bold hover:text-white/80 transition-colors">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 group-hover:to-white transition-all">Tech Specs</span>
                        <span className="group-hover:translate-x-4 transition-transform duration-500">→</span>
                    </a>
                </div>
            </section>
            <Footer />
        </main>
    );
}
