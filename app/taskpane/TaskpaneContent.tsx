// app/taskpane/TaskpaneContent.tsx
"use client";
import { useEffect, useState, useRef } from "react";

export default function TaskpaneContent() {
    const [ready, setReady] = useState(false);
    const [slideSummary, setSlideSummary] = useState("");
    const [globalSummary, setGlobalSummary] = useState("");
    const [isAnalyzingSlide, setIsAnalyzingSlide] = useState(false);
    const [isAnalyzingGlobal, setIsAnalyzingGlobal] = useState(false);

    // 1. Initialize Office and Slide Change Listener
    useEffect(() => {
        if (typeof window !== 'undefined' && window.Office) {
            window.Office.onReady((info) => {
                if (info.host === window.Office.HostType.PowerPoint) {
                    setReady(true);
                    // Listen for when user clicks a different slide
                    window.Office.context.document.addHandlerAsync(
                        window.Office.EventType.DocumentSelectionChanged,
                        () => summarizeCurrentSlide()
                    );
                    // Initial run for the first slide
                    summarizeCurrentSlide();
                }
            });
        }
    }, []);

    // 2. Extract Text from Current Slide
    async function summarizeCurrentSlide() {
        setIsAnalyzingSlide(true);
        try {
            await window.PowerPoint.run(async (context) => {
                const selected = context.presentation.getSelectedSlides();
                selected.load("items");
                await context.sync();
                const shapes = selected.items[0].shapes;
                shapes.load("items");
                await context.sync();

                let text = "";
                for (let shape of shapes.items) {
                    try {
                        shape.textFrame.load("textRange/text");
                        await context.sync();
                        text += shape.textFrame.textRange.text + " ";
                    } catch { continue; }
                }

                const res = await fetch('/api/summarize-slide', {
                    method: 'POST',
                    body: JSON.stringify({ text, type: "single" })
                });
                const data = await res.json();
                setSlideSummary(data.summary);
            });
        } finally { setIsAnalyzingSlide(false); }
    }

    // 3. Extract ALL Slides for Global Summary
    async function handleGlobalAnalysis() {
        setIsAnalyzingGlobal(true);
        try {
            await window.PowerPoint.run(async (context) => {
                const slides = context.presentation.slides;
                slides.load("items");
                await context.sync();
                let fullDeckText = "";

                for (let slide of slides.items) {
                    slide.shapes.load("items");
                    await context.sync();
                    for (let shape of slide.shapes.items) {
                        try {
                            shape.textFrame.load("textRange/text");
                            await context.sync();
                            fullDeckText += shape.textFrame.textRange.text + " ";
                        } catch { continue; }
                    }
                }

                const res = await fetch('/api/summarize-slide', {
                    method: 'POST',
                    body: JSON.stringify({ text: fullDeckText, type: "global" })
                });
                const data = await res.json();
                setGlobalSummary(data.summary);
            });
        } finally { setIsAnalyzingGlobal(false); }
    }

    if (!ready) return <div className="p-6 text-center animate-pulse">Connecting...</div>;

    return (
        <div className="flex flex-col h-screen bg-slate-50 font-sans p-5 space-y-6 overflow-y-auto">
            {/* GLOBAL SUMMARY */}
            <section className="bg-indigo-600 p-4 rounded-2xl shadow-lg text-white">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-[10px] font-black uppercase tracking-widest opacity-70">Main Overview</h2>
                    <button onClick={handleGlobalAnalysis} className="text-[10px] bg-white text-indigo-600 px-2 py-1 rounded font-bold">
                        {isAnalyzingGlobal ? 'SYNCING...' : 'REFRESH'}
                    </button>
                </div>
                <p className="text-sm leading-relaxed">{globalSummary || "Click refresh to analyze the full deck."}</p>
            </section>

            {/* SLIDE SUMMARY */}
            <section className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Active Slide</h3>
                <div className="text-sm text-slate-700 whitespace-pre-wrap">
                    {isAnalyzingSlide ? 'Analyzing new slide...' : slideSummary}
                </div>
            </section>
        </div>
    );
}