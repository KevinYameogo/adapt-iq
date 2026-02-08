
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateSummary(slides: string[]) {
    try {
        const prompt = `
      You are a helpful assistant that summarizes PowerPoint presentations.
      Here is the content of the slides:
      ${slides.map((slide, index) => `Slide ${index + 1}: ${slide}`).join("\n")}

      Please provide:
      1. A concise overall summary of the presentation.
      2. A brief 1-sentence summary for each slide.

      Return the response in JSON format:
      {
        "overall": "Overall summary text...",
        "slideSummaries": ["Summary for slide 1", "Summary for slide 2", ...]
      }
    `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a helpful presentation assistant." },
                { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("No content received from AI");

        return JSON.parse(content);
    } catch (error) {
        console.error("Error generating summary:", error);
        throw error;
    }
}
