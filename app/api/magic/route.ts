import { NextRequest, NextResponse } from "next/server";
import { generateDeckStructure } from "../../../lib/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { notes, structure, enableResearch = false } = body;

    if (!notes) {
      return NextResponse.json(
        { error: "Notes are required" },
        { status: 400 }
      );
    }

    console.log(`[API] /api/magic HIT! Structure: ${structure}, Research: ${enableResearch}`);
    const deck = await generateDeckStructure(notes, structure, enableResearch);

    if (!deck) {
      return NextResponse.json(
        { error: "Failed to generate deck" },
        { status: 500 }
      );
    }

    return NextResponse.json(deck);
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
