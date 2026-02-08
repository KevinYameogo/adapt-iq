// app/api/summarize-slide/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { text, type } = await req.json();
        const apiKey = "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";

        const systemPrompt = type === "global"
            ? "Summarize the entire presentation into 5 short bullet points (MAX 10 words per bullet) very concisely, each on a separate line,focused on the core message."
            : "Read the slide and identify structural pros&cons/what needs to be improved (cons include 2 max) and research quality. Keep it concise and separate lines. Use numbers for titles";
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "AdaptIQ",
            },
            body: JSON.stringify({
                model: "openrouter/free",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: text }
                ]
            })
        });

        const data = await response.json();
        return NextResponse.json({ summary: data.choices[0].message.content });
    } catch (err) {
        return NextResponse.json({ summary: "Error generating summary." }, { status: 500 });
    }
}