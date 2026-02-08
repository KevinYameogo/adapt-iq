import OpenAI from "openai";

// Initialize OpenAI client
// Note: In client-side code, use dangerouslyAllowBrowser: true only if you understand the risks
// Ideally, API calls should be routed through a backend endpoint to protect the key.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // For demo purposes, better to proxy through Next.js API route
});

export const analyzeEngagement = async (transcript: string, slideText: string) => {
  try {
    const prompt = `
      You are an expert presentation coach analyzing a live speech.
      I will provide:
      1. The speaker's transcript: "${transcript}"
      2. The text on the current slide: "${slideText}"

      Your task is to analyze the engagement level and provide concise, actionable suggestions.
      
      Return a JSON object with:
      - engagementScore (integer 1-100)
      - status (string: "Engaged", "Confused", "Losing Focus", "Neutral")
      - suggestion (string: A brief, actionable tip to improve the presentation right now. Max 15 words.)
      - actionType (string: "insert_slide", "simplify_text", "skip_ahead", "none")
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // or gpt-3.5-turbo
      messages: [{ role: "system", content: "You are a helpful presentation assistant." }, { role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No response from AI");
    
    return JSON.parse(content);
  } catch (error) {
    console.error("Error analyzing engagement:", error);
    return null;
  }
};

export const transcribeAudio = async (audioBlob: Blob) => {
  try {
    const file = new File([audioBlob], "audio.webm", { type: "audio/webm" });
    
    const response = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
    });

    return response.text;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    return null;
  }
};

export interface SummarizeSlidesResult {
  slideSummaries: string[];
  fullSummary: string;
}

/** Summarize each slide and the whole presentation. Call from server (API route) only. */
export const summarizeSlides = async (slideTexts: string[]): Promise<SummarizeSlidesResult | null> => {
  try {
    const slidesPayload = slideTexts
      .map((text, i) => `Slide ${i + 1}:\n${text || "(no text)"}`)
      .join("\n\n");

    const prompt = `You are summarizing a presentation for an audience who will view it later via a shareable link.

For each slide, provide a short summary (1-2 sentences) that captures the main point. At the end, provide one overall summary of the entire presentation (2-4 sentences).

Presentation content:
${slidesPayload}

Return a JSON object with exactly:
- slideSummaries: array of strings (one per slide, in order)
- fullSummary: string (overall presentation summary)`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful assistant that summarizes presentations clearly and concisely." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No response from AI");

    const parsed = JSON.parse(content) as { slideSummaries?: string[]; fullSummary?: string };
    const slideSummaries = Array.isArray(parsed.slideSummaries) ? parsed.slideSummaries : [];
    const fullSummary = typeof parsed.fullSummary === "string" ? parsed.fullSummary : "";

    return { slideSummaries, fullSummary };
  } catch (error) {
    console.error("Error summarizing slides:", error);
    return null;
  }
};
