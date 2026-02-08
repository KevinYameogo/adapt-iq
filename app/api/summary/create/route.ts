
import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        const { slides } = await req.json();

        if (!slides || !Array.isArray(slides) || slides.length === 0) {
            return NextResponse.json({ error: 'Invalid slides data' }, { status: 400 });
        }

        const id = uuidv4();
        store.save(id, slides);

        return NextResponse.json({ id });
    } catch (error) {
        console.error("Error creating summary:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
