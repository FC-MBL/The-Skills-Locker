import {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    COLOR_BLUE,
    COLOR_RED,
    FONT_VARSITY,
    FONT_ALERON,
    FONT_DIAMOND,
    COLOR_MAGENTA_KEY
} from '../../constants/thumbnailConstants';
import { processImageWithGemini } from '../../services/geminiService';

export const generateThumbnail = async (
    branchId: string,
    customBranch: string | undefined,
    courseName: string,
    authorName: string,
    authorImage?: string
): Promise<string> => {

    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) throw new Error("Could not get canvas context");

    // --- 1. Background ---
    ctx.fillStyle = COLOR_BLUE;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Red Slice
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

    // "SKILLS LOCKER"
    ctx.save();
    ctx.font = `120px ${FONT_VARSITY}`;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.strokeText("SKILLS LOCKER", 300, 70);
    ctx.restore();

    // --- 3. Branch ---
    const branchText = (branchId === 'other' ? customBranch : branchId) || 'Course';
    if (branchText) {
        ctx.save();
        ctx.font = `60px ${FONT_VARSITY}`;

        const metrics = ctx.measureText(branchText.toLowerCase());
        const boxWidth = metrics.width + 80;
        const boxHeight = 100;
        const boxX = 100;
        const boxY = 320;

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 20);
        ctx.fill();

        ctx.fillStyle = 'black';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        ctx.fillText(branchText.toLowerCase(), boxX + 40, boxY + (boxHeight / 2) + 5);
        ctx.restore();
    }

    // --- 4. Course Name ---
    if (courseName) {
        ctx.save();
        const cName = courseName.toUpperCase();
        let fontSize = 110;
        ctx.font = `bold ${fontSize}px ${FONT_ALERON}`;
        const maxTextWidth = CANVAS_WIDTH * 0.55;

        let textMetrics = ctx.measureText(cName);
        while (textMetrics.width > maxTextWidth && fontSize > 40) {
            fontSize -= 5;
            ctx.font = `bold ${fontSize}px ${FONT_ALERON}`;
            textMetrics = ctx.measureText(cName);
        }

        const words = cName.split(' ');
        let line = '';
        let y = 550;
        const lineHeight = fontSize * 1.2;

        ctx.fillStyle = 'white';
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const m = ctx.measureText(testLine);
            if (m.width > maxTextWidth && n > 0) {
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

    // --- 5. Author Image ---
    if (authorImage) {
        try {
            // Just use raw image for Programmatic generator for now, 
            // OR todo: implement the Gemini call via separate "Generate" action in UI.
            // Usually Metadata builder just sets the URL.
            const img = new Image();
            img.crossOrigin = 'anonymous';
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = authorImage;
            });

            ctx.save();
            const targetHeight = CANVAS_HEIGHT * 0.9;
            const scale = targetHeight / img.height;
            const drawWidth = img.width * scale;
            const drawHeight = img.height * scale;
            const drawX = CANVAS_WIDTH - drawWidth + 50;
            const drawY = CANVAS_HEIGHT - drawHeight;

            // Note: For metadata builder 'Auto-Gen', we probably skip the heavy AI call 
            // unless explicitly requested to save tokens/time. 
            // Assuming raw image placement for consistency with 'preview'.
            // If we want the outline, we'd need to process it.
            ctx.filter = 'grayscale(100%) contrast(150%)';
            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
            ctx.filter = 'none';
            ctx.restore();

        } catch (e) {
            console.error("Failed to load author image", e);
        }
    }

    // --- 6. Footer ---
    if (authorName) {
        ctx.save();
        ctx.font = `60px "${FONT_DIAMOND}"`;
        ctx.textBaseline = 'bottom';

        const startX = 250;
        const startY = CANVAS_HEIGHT - 80;

        ctx.fillStyle = 'black';
        ctx.fillText("With", startX, startY);
        const withMetrics = ctx.measureText("With ");

        ctx.fillStyle = 'white';
        ctx.fillText(authorName, startX + withMetrics.width + 10, startY);
        ctx.restore();
    }

    return canvas.toDataURL('image/png');
};
