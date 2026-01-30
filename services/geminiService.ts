import { GoogleGenAI } from "@google/genai";
import { COLOR_MAGENTA_KEY } from '../constants/thumbnailConstants';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export const processImageWithGemini = async (base64Image: string): Promise<string> => {
    if (!API_KEY || API_KEY === 'PLACEHOLDER_API_KEY') {
        throw new Error("API Key is missing. Please add your VITE_GEMINI_API_KEY to .env.local");
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    // Remove header if present (data:image/png;base64,)
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const prompt = `
    Transform this image of a person. 
    1. Remove the background completely and replace it with a SOLID, FLAT magenta color (${COLOR_MAGENTA_KEY}) exactly. No shadows, no gradients on the background.
    2. Convert the person's image to high contrast black and white (grayscale).
    3. Apply a posterize effect to the person.
    4. Ensure the person is centered and clearly visible.
    Return only the transformed image.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: {
                parts: [
                    {
                        text: prompt,
                    },
                    {
                        inlineData: {
                            mimeType: 'image/png',
                            data: cleanBase64,
                        },
                    },
                ],
            },
        });

        // Extract the image from the response
        // The response might contain an image part
        const parts = response.candidates?.[0]?.content?.parts;

        if (!parts) {
            throw new Error("No content returned from Gemini");
        }

        // Look for inlineData (image)
        const imagePart = parts.find(p => p.inlineData);

        if (imagePart && imagePart.inlineData && imagePart.inlineData.data) {
            return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        }

        // If no image part, check if text contains a URL (unlikely for this model but good for safety)
        // Or if the model refused to generate an image
        throw new Error("Gemini did not return an image. It might have returned text: " + (parts[0]?.text || "Unknown error"));

    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};
