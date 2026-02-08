import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { summarizeSlides } from "@/lib/ai";
import { saveDeck } from "@/lib/deck-store";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const slides = body.slides as Array<{ index: number; text: string; imageBase64: string }> | undefined;
    const presenterSocials = body.presenterSocials as { name?: string; twitter?: string; linkedin?: string; instagram?: string } | undefined;

    if (!Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json({ error: "slides array required and must not be empty" }, { status: 400 });
    }

    const id = crypto.randomUUID().slice(0, 8);
    const slideTexts = slides.map((s) => s.text || "");
    const summary = await summarizeSlides(slideTexts);

    if (!summary) {
      return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
    }

    const deck = {
      slideSummaries: summary.slideSummaries,
      fullSummary: summary.fullSummary,
      slides: slides.map(({ index, text, imageBase64 }) => ({ index, text, imageBase64 })),
      presenterSocials: presenterSocials && (presenterSocials.name || presenterSocials.twitter || presenterSocials.linkedin || presenterSocials.instagram)
        ? presenterSocials
        : undefined,
    };

    saveDeck(id, deck);

    const url = `${BASE_URL}/s/${id}`;
    const qrDataUrl = await QRCode.toDataURL(url, { width: 256, margin: 2 });

    return NextResponse.json({
      id,
      url,
      qrDataUrl,
      slideCount: slides.length,
    });
  } catch (error) {
    console.error("Summary API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
