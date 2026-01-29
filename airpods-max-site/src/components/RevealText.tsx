"use client";

import { motion, Variants } from "framer-motion";

export const textReveal: Variants = {
    hidden: { y: "100%" },
    visible: { y: "0%", transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] } },
};

export const containerReveal = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
};

export function RevealText({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`overflow-hidden ${className}`}>
            <motion.div variants={textReveal} initial="hidden" whileInView="visible" viewport={{ once: false }}>
                {children}
            </motion.div>
        </div>
    );
}
