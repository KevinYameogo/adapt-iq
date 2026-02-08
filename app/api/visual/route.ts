import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, style = "photorealistic" } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    console.log(`[API] /api/visual generating image: ${prompt}`);

    // Enhance prompt for professional presentation aesthetics
    const enhancedPrompt = `A high-quality, professional ${style} illustration of: ${prompt}. Minimalist, clean composition, presentation-ready, high resolution, soft lighting, concept art style.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    });

    const imageData = response.data[0].b64_json;

    return NextResponse.json({ image: imageData });
  } catch (error: any) {
    console.error("DALL-E Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate image" },
      { status: 500 }
    );
  }
}
