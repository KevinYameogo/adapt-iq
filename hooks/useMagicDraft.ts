import { useState } from "react";
import { insertDeck } from "../lib/office";

export const useMagicDraft = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateDeck = async (notes: string, structure: string, enableResearch: boolean = false) => {
        setIsGenerating(true);
        setError(null);
        try {
            console.log(`[useMagicDraft] Generating deck: ${structure}, Research: ${enableResearch}`);
            
            // 1. Call API
            const res = await fetch("/api/magic", {
                method: "POST",
                body: JSON.stringify({ notes, structure, enableResearch }),
                headers: { "Content-Type": "application/json" }
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to generate deck");
            }

            const data = await res.json();
            console.log("[useMagicDraft] API Response:", data);

            if (!data.slides || !Array.isArray(data.slides)) {
                throw new Error("Invalid response format from AI");
            }

            // 2. Insert Slides with structure-based theming
            console.log("[useMagicDraft] Inserting slides...");
            await insertDeck(data.slides, structure);
            console.log("[useMagicDraft] Slides inserted!");

        } catch (err: any) {
            console.error("Magic Draft Error:", err);
            setError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return { generateDeck, isGenerating, error };
};
