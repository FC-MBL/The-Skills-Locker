import React, { useRef, useEffect, useState } from 'react';
import { ThumbnailData } from '../types/thumbnail';
import {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    COLOR_BLUE,
    COLOR_RED,
    FONT_VARSITY,
    FONT_ALERON,
    FONT_DIAMOND
} from '../constants/thumbnailConstants';

interface ThumbnailCanvasProps {
    data: ThumbnailData;
    onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

const ThumbnailCanvas: React.FC<ThumbnailCanvasProps> = ({ data, onCanvasReady }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [imagesLoaded, setImagesLoaded] = useState<{ profile?: HTMLImageElement, processed?: HTMLImageElement, logo?: HTMLImageElement }>({});

    // Helper to load image
    const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    };

    // Preload images when data changes
    useEffect(() => {
        const loadImages = async () => {
            const loaded: { profile?: HTMLImageElement, processed?: HTMLImageElement } = {};

            if (data.profileImage) {
                try {
                    loaded.profile = await loadImage(data.profileImage);
                } catch (e) {
                    console.error("Failed to load profile image", e);
                }
            }

            if (data.processedImage) {
                try {
                    loaded.processed = await loadImage(data.processedImage);
                } catch (e) {
                    console.error("Failed to load processed image", e);
                }
            }

            setImagesLoaded(prev => ({ ...prev, ...loaded }));
        };

        loadImages();
    }, [data.profileImage, data.processedImage]);

    // Main Draw Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        // --- 1. Background ---
        ctx.fillStyle = COLOR_BLUE;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Red Diagonal Slice (Right side)
        ctx.fillStyle = COLOR_RED;
        ctx.beginPath();
        ctx.moveTo(CANVAS_WIDTH * 0.65, 0);
        ctx.lineTo(CANVAS_WIDTH, 0);
        ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.lineTo(CANVAS_WIDTH * 0.55, CANVAS_HEIGHT);
        ctx.closePath();
        ctx.fill();

        // --- 2. Logo & Header ---
        ctx.save();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 5;
        ctx.fillStyle = 'transparent';

        const logoX = 80;
        const logoY = 80;

        ctx.beginPath();
        ctx.arc(logoX + 50, logoY + 50, 60, 0, Math.PI * 2);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = 'white';
        ctx.font = `bold 30px ${FONT_VARSITY}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText("FIT", logoX + 50, logoY + 40);

        ctx.font = `16px ${FONT_ALERON}`;
        ctx.fillStyle = 'white';
        ctx.fillText("COLLEGE", logoX + 50, logoY + 70);
        ctx.restore();

        // SKILLS LOCKER Text
        ctx.save();
        ctx.font = `120px ${FONT_VARSITY}`;
        ctx.fillStyle = 'transparent';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 4;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const titleX = 300;
        const titleY = 70;
        ctx.strokeText("SKILLS LOCKER", titleX, titleY);
        ctx.restore();

        // --- 3. Branch Label ---
        if (data.branch) {
            ctx.save();
            const branchText = data.branch; // .toLowerCase() handled in display
            ctx.font = `60px ${FONT_VARSITY}`;

            const metrics = ctx.measureText(branchText.toLowerCase());
            const textWidth = metrics.width;
            const padding = 40;
            const boxHeight = 100;
            const boxWidth = textWidth + (padding * 2);
            const boxX = 100;
            const boxY = 320;

            // Draw rounded rect
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 20);
            ctx.fill();

            // Draw Text
            ctx.fillStyle = 'black';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'left';
            ctx.fillText(branchText.toLowerCase(), boxX + padding, boxY + (boxHeight / 2) + 5);
            ctx.restore();
        }

        // --- 4. Course Name ---
        if (data.courseName) {
            ctx.save();
            const courseName = data.courseName.toUpperCase();
            let fontSize = 110;
            ctx.font = `bold ${fontSize}px ${FONT_ALERON}`;

            const maxTextWidth = CANVAS_WIDTH * 0.55;
            let textMetrics = ctx.measureText(courseName);

            while (textMetrics.width > maxTextWidth && fontSize > 40) {
                fontSize -= 5;
                ctx.font = `bold ${fontSize}px ${FONT_ALERON}`;
                textMetrics = ctx.measureText(courseName);
            }

            const words = courseName.split(' ');
            let line = '';
            let y = 550;
            const lineHeight = fontSize * 1.2;

            ctx.fillStyle = 'white';
            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > maxTextWidth && n > 0) {
                    ctx.fillText(line, 100, y);
                    line = words[n] + ' ';
                    y += lineHeight;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, 100, y);
            ctx.restore();
        }

        // --- 5. User Profile Image (Right Side) ---
        const imgToDraw = imagesLoaded.processed || imagesLoaded.profile;

        if (imgToDraw) {
            ctx.save();
            const targetHeight = CANVAS_HEIGHT * 0.9;
            const scale = targetHeight / imgToDraw.height;
            const drawWidth = imgToDraw.width * scale;
            const drawHeight = imgToDraw.height * scale;
            const drawX = CANVAS_WIDTH - drawWidth + 50;
            const drawY = CANVAS_HEIGHT - drawHeight;

            if (imagesLoaded.processed) {
                // Processed Image with Outline
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = drawWidth;
                tempCanvas.height = drawHeight;
                const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });

                if (tempCtx) {
                    tempCtx.drawImage(imgToDraw, 0, 0, drawWidth, drawHeight);

                    // 1. Chroma Key (Remove Magenta/Green Screen if present)
                    // Assuming Gemini returns Magenta background if prompted, or we just trust transparency.
                    // For robustness, let's keep the keying but tune it.
                    const imageData = tempCtx.getImageData(0, 0, drawWidth, drawHeight);
                    const data = imageData.data;
                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];
                        // Strict Magenta Check (High R & B, Low G)
                        if (r > 200 && b > 200 && g < 100) {
                            data[i + 3] = 0;
                        }
                    }
                    tempCtx.putImageData(imageData, 0, 0);

                    // 2. Apply White Outline using Shadow
                    ctx.filter = `
                        drop-shadow(3px 0 0 white)
                        drop-shadow(-3px 0 0 white)
                        drop-shadow(0 3px 0 white)
                        drop-shadow(0 -3px 0 white)
                    `;

                    // Draw the clean, keyed image with the shadow filter
                    ctx.drawImage(tempCanvas, drawX, drawY);

                    // Reset filter
                    ctx.filter = 'none';

                    // Optional: Draw image again on top if shadow makes it blurry, 
                    // but usually clean overlay is better.
                    // ctx.drawImage(tempCanvas, drawX, drawY);
                }
            } else {
                // Raw Image Fallback
                ctx.filter = 'grayscale(100%) contrast(150%)';
                ctx.drawImage(imgToDraw, drawX, drawY, drawWidth, drawHeight);
                ctx.filter = 'none';
            }
            ctx.restore();
        }

        // --- 6. Footer ("With Full Name") ---
        if (data.fullName) {
            ctx.save();
            ctx.font = `60px "${FONT_DIAMOND}"`; // Quotes to handle spaces in 'Black Diamond'
            ctx.textBaseline = 'bottom';
            const startX = 250;
            const startY = CANVAS_HEIGHT - 80;

            // "With" (Black)
            ctx.fillStyle = 'black';
            ctx.fillText("With", startX, startY);

            const withWidth = ctx.measureText("With ").width;

            // "Full Name" (White)
            ctx.fillStyle = 'white';
            ctx.fillText(data.fullName, startX + withWidth + 10, startY);
            ctx.restore();
        }

        if (onCanvasReady) {
            onCanvasReady(canvas);
        }

    }, [data, imagesLoaded, onCanvasReady]);

    return (
        <div className="w-full aspect-video shadow-2xl rounded-lg overflow-hidden border border-gray-200 bg-gray-900">
            <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="w-full h-full object-contain"
            />
        </div>
    );
};

export default ThumbnailCanvas;
