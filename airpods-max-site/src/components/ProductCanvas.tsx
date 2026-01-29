"use client";

import { useRef, useEffect } from "react";
import { useImageSequence } from "@/hooks/useImageSequence";

interface ProductCanvasProps {
    currentFrame: number;
    frameCount: number;
}

export default function ProductCanvas({ currentFrame, frameCount }: ProductCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { draw, loadedCount, progress } = useImageSequence(frameCount);

    // Re-draw when currentFrame or draw function changes
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Handle high-DPI displays
        const dpr = window.devicePixelRatio || 1;
        // We rely on CSS for size, but need internal resolution to match
        // However, resizing canvas clears it, so we should only do it on resize

        // For now, let's assume we handle resize in a separate effect or just use fixed logic
        // A robust way is to check clientWidth/height on each frame? slightly expensive.
        // Better: ResizeObserver.

        // Simple approach: set canvas dims to window inner size in a ResizeObserver

        draw(ctx, currentFrame, canvas.width, canvas.height);
    }, [currentFrame, draw]);

    // Handle Resize
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleResize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                // Set actual resolution to match display size * DPR
                const dpr = window.devicePixelRatio || 1;
                canvas.width = parent.clientWidth * dpr;
                canvas.height = parent.clientHeight * dpr;

                // Ensure we re-draw immediately after resize
                const ctx = canvas.getContext("2d");
                if (ctx) draw(ctx, currentFrame, canvas.width, canvas.height);
            }
        };

        window.addEventListener("resize", handleResize);
        handleResize(); // Init

        return () => window.removeEventListener("resize", handleResize);
    }, [draw, currentFrame]); // dep on currentFrame to redraw correctly after resize

    return (
        <div className="relative w-full h-full">
            <canvas
                ref={canvasRef}
                className="block w-full h-full object-cover"
                style={{ width: "100%", height: "100%" }}
            />

            {/* Loading Indicator */}
            {progress < 1 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-50 transition-opacity duration-500"
                    style={{ opacity: progress > 0.9 ? 0 : 1, pointerEvents: "none" }}>
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <p className="text-white/60 text-sm font-medium tracking-wide">
                            Loading Experience ({Math.round(progress * 100)}%)
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
