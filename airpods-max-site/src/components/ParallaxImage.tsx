"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";

interface ParallaxImageProps {
    src: string;
    alt: string;
    className?: string;
}

export default function ParallaxImage({ src, alt, className }: ParallaxImageProps) {
    const ref = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1.2, 1.1]);

    return (
        <div ref={ref} className={`overflow-hidden relative ${className}`}>
            <motion.div style={{ y, scale }} className="w-full h-full relative">
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className={`object-cover transition-opacity duration-700 ease-out ${isLoaded ? "opacity-100" : "opacity-0"}`}
                    onLoad={() => setIsLoaded(true)}
                />
            </motion.div>
        </div>
    );
}
