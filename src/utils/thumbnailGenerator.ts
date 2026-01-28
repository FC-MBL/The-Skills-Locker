import { DOMAINS } from '../../data';
import removeBackground from '@imgly/background-removal';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

/**
 * Generates a thumbnail for a course based on the provided metadata.
 * @param branchId The ID of the selected branch/domain.
 * @param customBranch Content for the branch label if 'other' is selected.
 * @param title The title of the course.
 * @param contributorName The name of the contributor.
 * @param contributorImage The URL/DataURL of the contributor's profile image.
 * @returns A Promise that resolves to the generated thumbnail as a Data URL.
 */
export const generateThumbnail = async (
    branchId: string,
    customBranch: string | undefined,
    title: string,
    contributorName: string,
    contributorImage: string
): Promise<string> => {
    const width = 1280;
    const height = 720;
    // Concept Base: 1920x1080
    const baseWidth = 1920;
    const baseHeight = 1080;
    const scale = Math.min(width / baseWidth, height / baseHeight);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Could not get canvas context');

    // 1. Load Fonts
    console.log("Loading fonts...");
    try {
        const varsity = new FontFace('Varsity', 'url(/fonts/varsity_regular.ttf)');
        const aileron = new FontFace('Aileron', 'url(/fonts/Aileron-Bold.otf)', { weight: '700' });
        const blackDiamond = new FontFace('Black Diamond', 'url(/fonts/Set Sail Studios - BlackDiamond.otf)');
        await Promise.all([varsity.load(), aileron.load(), blackDiamond.load()]);
        document.fonts.add(varsity);
        document.fonts.add(aileron);
        document.fonts.add(blackDiamond);
        console.log("Fonts loaded");
    } catch (e) {
        console.error("Failed to load fonts", e);
    }

    // 2. Load Template
    console.log("Loading template...");
    const templateImg = new Image();
    templateImg.crossOrigin = 'anonymous';
    templateImg.src = '/images/thumbnail_template.png';
    await new Promise<void>((resolve, reject) => {
        templateImg.onload = () => {
            console.log("Template loaded");
            resolve();
        };
        templateImg.onerror = (e) => {
            console.error("Template load error", e);
            reject(e);
        };
    });

    // 3. Draw Template Background
    ctx.drawImage(templateImg, 0, 0, width, height);

    // 4. Draw Branch Name
    // Concept (1920x1080): Center X=638, Y=351.
    const contentCenterX = Math.round(638 * scale);
    const labelTop = Math.round(351 * scale);

    let branchText = '';
    if (branchId === 'other' && customBranch) {
        branchText = customBranch;
    } else {
        const domain = DOMAINS.find(d => d.id === branchId);
        branchText = domain ? domain.name : 'Branch';
    }

    branchText = branchText.toUpperCase();
    const branchFontSize = Math.round(90 * scale);
    ctx.font = `${branchFontSize}px "Varsity"`;
    const branchTextMetrics = ctx.measureText(branchText);
    const branchBoxPadding = Math.round(38 * scale);
    const branchBoxWidth = branchTextMetrics.width + (branchBoxPadding * 2);
    const branchBoxHeight = Math.round(135 * scale);
    const branchBoxX = Math.round(contentCenterX - (branchBoxWidth / 2));
    const branchBoxY = labelTop;

    // Draw Rounded Rectangle
    ctx.fillStyle = 'white';
    roundRect(ctx, branchBoxX, branchBoxY, branchBoxWidth, branchBoxHeight, Math.round(30 * scale));
    ctx.fill();

    // Draw Branch Text
    ctx.fillStyle = 'black';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(branchText, contentCenterX, branchBoxY + (branchBoxHeight / 2));

    // 5. Draw Course Title
    // Concept Y = 450.
    const titleY = Math.round(450 * scale);
    const maxTitleWidth = Math.round(1140 * scale);
    let titleFontSize = Math.round(165 * scale);
    ctx.fillStyle = 'white';
    ctx.font = `700 ${titleFontSize}px "Aileron", sans-serif`;

    while (ctx.measureText(title).width > maxTitleWidth && titleFontSize > 30) {
        titleFontSize -= 5;
        ctx.font = `700 ${titleFontSize}px "Aileron", sans-serif`;
    }

    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    wrapText(ctx, title.toUpperCase(), contentCenterX, titleY, maxTitleWidth, titleFontSize * 1.2);


    // 6. Footer: "with [Contributor Name]"
    // Concept X = 375, Y = 1034. 
    const footerLeft = Math.round(375 * scale);
    const bottomTextY = Math.round(1034 * scale);
    const withText = "With ";
    const contribText = contributorName;

    ctx.font = `${Math.round(90 * scale)}px "Black Diamond", serif`;
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'left';

    ctx.fillStyle = 'black';
    ctx.fillText(withText, footerLeft, bottomTextY);

    const withWidth = ctx.measureText(withText).width;
    ctx.fillStyle = 'white';
    ctx.fillText(contribText, footerLeft + withWidth + 10, bottomTextY);

    // 7. Draw Profile Image with Effect
    // Load raw image first
    let rawImage = await loadContributorImage(contributorImage, contributorName);

    if (rawImage) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = rawImage.width;
        tempCanvas.height = rawImage.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
            tempCtx.drawImage(rawImage, 0, 0);
        }
        const base64Data = tempCanvas.toDataURL('image/png');

        try {
            console.log("Processing image via Cloud Function...");

            const processImage = httpsCallable(functions, 'process_image');

            // Call Cloud Function
            const result = await processImage({ image: base64Data });
            const data = result.data as { image?: string, error?: string };

            if (data.error) throw new Error(data.error);
            if (!data.image) throw new Error("No image data returned from server");

            const processedImg = await loadImage(data.image);
            const isOpaque = await isMostlyOpaque(processedImg, 0.95);
            if (isOpaque) {
                throw new Error("Background removal returned an opaque image");
            }

            // Draw Processed Image
            // Concept: Height 90% canvas. Right aligned + 50px buffer. 
            const imgHeight = height * 0.9;
            const imgScale = imgHeight / processedImg.height;
            const imgWidth = processedImg.width * imgScale;

            const imgX = width - imgWidth + Math.round(50 * scale);
            const imgY = height - imgHeight;

            ctx.save();
            // Server side does processing, but we can verify if we need any client side drawing helpers
            // The server does BG removal + Posterize. 
            // We just draw it.
            ctx.drawImage(processedImg, imgX, imgY, imgWidth, imgHeight);
            ctx.restore();

        } catch (e) {
            console.error("Failed to process profile image via Cloud Function", e);
            try {
                const processedCanvas = await processImageClient(base64Data);
                const imgHeight = height * 0.9;
                const imgScale = imgHeight / processedCanvas.height;
                const imgWidth = processedCanvas.width * imgScale;
                const imgX = width - imgWidth + Math.round(50 * scale);
                const imgY = height - imgHeight;
                ctx.save();
                ctx.drawImage(processedCanvas, imgX, imgY, imgWidth, imgHeight);
                ctx.restore();
            } catch (clientErr) {
                console.error("Client-side background removal failed", clientErr);
                // Final fallback: draw raw image with simple grayscale
                if (rawImage) {
                    const imgHeight = height * 0.9;
                    const imgScale = imgHeight / rawImage.height;
                    const imgWidth = rawImage.width * imgScale;
                    const imgX = width - imgWidth + Math.round(50 * scale);
                    const imgY = height - imgHeight;
                    ctx.save();
                    ctx.filter = 'grayscale(100%) contrast(120%) drop-shadow(0px 0px 5px white)';
                    ctx.drawImage(rawImage, imgX, imgY, imgWidth, imgHeight);
                    ctx.restore();
                }
            }
        }
    }

    return canvas.toDataURL('image/png');
};

// Helper for rounded rect
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

// Helper for wrapping text
function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(' ');
    let line = '';

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line.trimEnd(), x, y);
            line = words[n] + ' ';
            y += lineHeight;
        }
        else {
            line = testLine;
        }
    }
    ctx.fillText(line.trimEnd(), x, y);
}

function isSafeCanvasSource(src: string) {
    return src.startsWith('data:') || src.startsWith('blob:') || src.startsWith('/') || src.startsWith(window.location.origin);
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = src;
    });
}

async function isMostlyOpaque(img: HTMLImageElement, threshold = 0.95) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return false;
    tempCtx.drawImage(img, 0, 0);
    const data = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data;
    let opaque = 0;
    const total = data.length / 4;
    for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 10) opaque += 1;
    }
    return (opaque / total) >= threshold;
}

async function processImageClient(base64Data: string): Promise<HTMLCanvasElement> {
    const blob = await removeBackground(base64Data, {
        output: { format: 'image/png', type: 'foreground' }
    });
    const objectUrl = URL.createObjectURL(blob);
    try {
        const cutout = await loadImage(objectUrl);
        return stylizeCutout(cutout);
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

function stylizeCutout(img: HTMLImageElement): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let min = 255;
    let max = 0;
    for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha > 10) {
            const gray = Math.round((data[i] * 0.299) + (data[i + 1] * 0.587) + (data[i + 2] * 0.114));
            if (gray < min) min = gray;
            if (gray > max) max = gray;
        }
    }

    const range = Math.max(1, max - min);
    for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha > 10) {
            let gray = Math.round((data[i] * 0.299) + (data[i + 1] * 0.587) + (data[i + 2] * 0.114));
            gray = Math.round(((gray - min) * 255) / range);
            gray = Math.max(0, Math.min(255, gray));
            const poster = Math.round(gray / 16) * 16;
            data[i] = poster;
            data[i + 1] = poster;
            data[i + 2] = poster;
        }
    }

    ctx.putImageData(imageData, 0, 0);

    const stroke = Math.max(6, Math.round(canvas.height * 0.01));
    return addOutline(canvas, stroke);
}

function addOutline(sourceCanvas: HTMLCanvasElement, stroke: number): HTMLCanvasElement {
    const w = sourceCanvas.width;
    const h = sourceCanvas.height;

    const silhouette = document.createElement('canvas');
    silhouette.width = w;
    silhouette.height = h;
    const silCtx = silhouette.getContext('2d');
    if (!silCtx) return sourceCanvas;
    silCtx.drawImage(sourceCanvas, 0, 0);
    silCtx.globalCompositeOperation = 'source-in';
    silCtx.fillStyle = '#ffffff';
    silCtx.fillRect(0, 0, w, h);
    silCtx.globalCompositeOperation = 'source-over';

    const outlineCanvas = document.createElement('canvas');
    outlineCanvas.width = w;
    outlineCanvas.height = h;
    const outlineCtx = outlineCanvas.getContext('2d');
    if (!outlineCtx) return sourceCanvas;

    const radiusSq = stroke * stroke;
    for (let y = -stroke; y <= stroke; y += 1) {
        for (let x = -stroke; x <= stroke; x += 1) {
            if ((x * x + y * y) <= radiusSq) {
                outlineCtx.drawImage(silhouette, x, y);
            }
        }
    }

    outlineCtx.globalCompositeOperation = 'destination-out';
    outlineCtx.drawImage(silhouette, 0, 0);
    outlineCtx.globalCompositeOperation = 'source-over';

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = w;
    finalCanvas.height = h;
    const finalCtx = finalCanvas.getContext('2d');
    if (!finalCtx) return sourceCanvas;
    finalCtx.drawImage(outlineCanvas, 0, 0);
    finalCtx.drawImage(sourceCanvas, 0, 0);
    return finalCanvas;
}

async function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
}

function getInitials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'C';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function generateInitialsAvatar(name: string, size = 512) {
    const avatarCanvas = document.createElement('canvas');
    avatarCanvas.width = size;
    avatarCanvas.height = size;
    const avatarCtx = avatarCanvas.getContext('2d');
    if (!avatarCtx) return '';
    avatarCtx.fillStyle = '#e5e7eb';
    avatarCtx.fillRect(0, 0, size, size);
    avatarCtx.fillStyle = '#111827';
    avatarCtx.font = `${Math.floor(size * 0.35)}px sans-serif`;
    avatarCtx.textAlign = 'center';
    avatarCtx.textBaseline = 'middle';
    avatarCtx.fillText(getInitials(name), size / 2, size / 2);
    return avatarCanvas.toDataURL('image/png');
}

async function loadContributorImage(src: string, name: string): Promise<HTMLImageElement | null> {
    if (!src) {
        const fallback = generateInitialsAvatar(name);
        return fallback ? loadImage(fallback) : null;
    }

    if (isSafeCanvasSource(src)) {
        try {
            return await loadImage(src);
        } catch (e) {
            console.warn('Safe image failed to load, using initials fallback', e);
            const fallback = generateInitialsAvatar(name);
            return fallback ? loadImage(fallback) : null;
        }
    }

    try {
        const response = await fetch(src, { mode: 'cors' });
        if (!response.ok) throw new Error(`Image fetch failed: ${response.status}`);
        const blob = await response.blob();
        const dataUrl = await blobToDataUrl(blob);
        return await loadImage(dataUrl);
    } catch (e) {
        console.warn('Remote image blocked by CORS, using initials fallback', e);
        const fallback = generateInitialsAvatar(name);
        return fallback ? loadImage(fallback) : null;
    }
}
