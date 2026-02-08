import { useState } from 'react';
import { getSlideText, insertImage } from '@/lib/office';

export const useVisuals = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateVisualForCurrentSlide = async () => {
        setIsGenerating(true);
        setError(null);

        try {
            // 1. Get text from current slide
            console.log("[useVisuals] Extracting slide text...");
            const text = await getSlideText();
            
            if (!text || text.trim().length === 0) {
                throw new Error("Slide is empty. Add some text first so the AI can imagine a visual metaphor!");
            }

            // 2. Call the visual API
            // The API handles prompt enhancement (turning text into a metaphor)
            console.log("[useVisuals] Requesting AI visual for:", text.substring(0, 50) + "...");
            const response = await fetch('/api/visual', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    prompt: text,
                    style: "3D render" // Hardcoded for 'wow' factor in hackathon
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate visual");
            }

            // 3. Insert into PowerPoint
            console.log("[useVisuals] Image received, inserting into slide...");
            await insertImage(data.image);
            
            console.log("[useVisuals] Success!");
        } catch (err: any) {
            console.error("[useVisuals] Error:", err);
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsGenerating(false);
        }
    };

    return {
        generateVisualForCurrentSlide,
        isGenerating,
        error
    };
};
