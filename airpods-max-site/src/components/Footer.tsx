"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Footer() {
    return (
        <footer className="relative z-10 bg-black pt-24 pb-12 border-t border-white/5 overflow-hidden">
            {/* Top Gradient Line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link href="/" className="inline-block">
                            <h3 className="text-2xl font-semibold tracking-tight text-white hover:text-white/90 transition-colors">AirPods Max</h3>
                        </Link>
                        <p className="text-white/40 text-sm leading-relaxed max-w-xs font-light">
                            The ultimate personal listening experience. Computational audio. Adaptive EQ. Active Noise Cancellation.
                        </p>
                    </div>

                    {/* Navigation Columns */}
                    <div>
                        <h4 className="text-xs font-semibold text-white mb-6 uppercase tracking-widest opacity-80">Explore</h4>
                        <ul className="space-y-4 text-sm text-white/50 font-medium">
                            <li><Link href="/" className="hover:text-white transition-colors">Overview</Link></li>
                            <li><Link href="/about" className="hover:text-white transition-colors">Story of Sound</Link></li>
                            <li><Link href="/product-details" className="hover:text-white transition-colors">Tech Specs</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-semibold text-white mb-6 uppercase tracking-widest opacity-80">Shop</h4>
                        <ul className="space-y-4 text-sm text-white/50 font-medium">
                            <li><Link href="#" className="hover:text-white transition-colors">Buy AirPods Max</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">AirPods Pro</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Accessories</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-semibold text-white mb-6 uppercase tracking-widest opacity-80">Support</h4>
                        <ul className="space-y-4 text-sm text-white/50 font-medium">
                            <li><a href="#" className="hover:text-white transition-colors">Find a Store</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Apple Care+</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/30 font-light tracking-wide">
                    <p>&copy; {new Date().getFullYear()} AirPods Max Concept. Designed for excellence.</p>
                    <div className="flex gap-8">
                        <Link href="#" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white/60 transition-colors">Terms of Use</Link>
                        <Link href="#" className="hover:text-white/60 transition-colors">Site Map</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
