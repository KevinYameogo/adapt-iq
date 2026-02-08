import { NextRequest, NextResponse } from "next/server";
import { analyzeEngagement, transcribeAudio } from "@/lib/ai";

export async function POST(req: NextRequest) {
  console.log("👉 [API] /api/analyze HIT!");
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as Blob;
    const slideText = formData.get("slideText") as string;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    console.log(
      `[api/analyze] Received audio blob. Size: ${(
        audioFile.size / 1024
      ).toFixed(2)} KB`
    );

    // 1. Transcribe
    const transcript = await transcribeAudio(audioFile);
    if (!transcript) {
      // If transcription fails or is empty, we might just return (or handle error)
      return NextResponse.json(
        { error: "Transcription failed" },
        { status: 500 }
      );
    }

    // 2. Analyze
    console.log(`\x1b[36mTranscript:\x1b[0m \x1b[1m"${transcript}"\x1b[0m`); // Cyan & Bold
    const analysis = await analyzeEngagement(transcript, slideText || "");

    if (analysis && analysis.status === "Command Detected") {
      console.log(
        `\x1b[35mCOMMAND DETECTED:\x1b[0m \x1b[1m${analysis.actionType} ${analysis.suggestion}\x1b[0m`
      );
    }

    return NextResponse.json({
      transcript,
      analysis,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
