"use client";

import { useEffect, useState, useRef } from "react";

export function useImageSequence(frameCount: number) {
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [loadedCount, setLoadedCount] = useState(0);
    const imagesRef = useRef<HTMLImageElement[]>([]);

    useEffect(() => {
        // Prevent double loading in strict mode
        if (imagesRef.current.length > 0) return;

        const loadImages = () => {
            const promises = [];
            const loadedImgs: HTMLImageElement[] = new Array(frameCount).fill(null);

            // We populate the ref array immediately so we have slots
            // imagesRef.current might be sparse initially if accessed too early, handled by null check in draw
            imagesRef.current = loadedImgs;

            for (let i = 1; i <= frameCount; i++) {
                const img = new Image();
                const padIndex = i.toString().padStart(3, "0");
                img.src = `/frames/ezgif-frame-${padIndex}.jpg`;

                const promise = new Promise<void>((resolve) => {
                    img.onload = () => {
                        loadedImgs[i - 1] = img;
                        setLoadedCount((prev) => prev + 1);
                        resolve();
                    };
                    img.onerror = () => {
                        // Handle error if needed, maybe retry or skip
                        resolve();
                    };
                });
                promises.push(promise);
            }

            Promise.all(promises).then(() => {
                setImages(loadedImgs);
            });
        };

        loadImages();
    }, [frameCount]);

    const draw = (ctx: CanvasRenderingContext2D, index: number, canvasWidth: number, canvasHeight: number) => {
        const image = imagesRef.current[index];
        if (!image) return;

        // Calculate aspect ratio to cover the canvas (like object-fit: cover)
        const imgRatio = image.width / image.height;
        const canvasRatio = canvasWidth / canvasHeight;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (imgRatio > canvasRatio) {
            // Image is wider than canvas
            drawHeight = canvasHeight;
            drawWidth = drawHeight * imgRatio;
            offsetX = (canvasWidth - drawWidth) / 2;
            offsetY = 0;
        } else {
            // Image is taller than canvas
            drawWidth = canvasWidth;
            drawHeight = drawWidth / imgRatio;
            offsetX = 0;
            offsetY = (canvasHeight - drawHeight) / 2;
        }

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    };

    return { images, loadedCount, progress: loadedCount / frameCount, draw };
}
