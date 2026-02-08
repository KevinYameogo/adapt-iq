
import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const id = params.id;
    const presentation = store.get(id);

    if (!presentation) {
        return NextResponse.json({ error: 'Presentation not found' }, { status: 404 });
    }

    return NextResponse.json(presentation);
}
