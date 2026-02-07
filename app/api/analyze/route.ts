import { NextRequest, NextResponse } from 'next/server';
import { analyzeEngagement, transcribeAudio } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as Blob;
    const slideText = formData.get('slideText') as string;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // 1. Transcribe
    const transcript = await transcribeAudio(audioFile);
    if (!transcript) {
        // If transcription fails or is empty, we might just return (or handle error)
        return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
    }

    // 2. Analyze
    const analysis = await analyzeEngagement(transcript, slideText || "");
    
    return NextResponse.json({
        transcript,
        analysis
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
