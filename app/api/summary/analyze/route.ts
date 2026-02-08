
import { NextRequest, NextResponse } from 'next/server';
import { generateSummary } from '@/lib/ai-summary';

export async function POST(req: NextRequest) {
    try {
        const { slides } = await req.json();

        if (!slides || !Array.isArray(slides) || slides.length === 0) {
            return NextResponse.json({ error: 'Invalid slides data' }, { status: 400 });
        }

        const summary = await generateSummary(slides);

        return NextResponse.json(summary);
    } catch (error) {
        console.error("Error analyzing summary:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
