"use client";

import { useEffect, useState, useRef } from "react";
import { useEngagement } from "../../hooks/useEngagement";
import StatusIndicator from "../../components/StatusIndicator";
import Controls from "../../components/Controls";
import SuggestionCard from "../../components/SuggestionCard";
import { TaskpaneErrorBoundary } from "./TaskpaneErrorBoundary";
import { getAllSlidesContent, insertSlideWithUrl } from "@/lib/office";

declare global {
  interface Window {
    Office?: any;
    PowerPoint?: any;
  }
}

function TaskpaneContent() {
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<"auto" | "manual" | "summary">("auto");
  const isMounted = useRef(true);

  // Manual slide state
  const [title, setTitle] = useState("AI Slide Title");
  const [bullets, setBullets] = useState("First bullet\nSecond bullet\nThird bullet");
  const [notes, setNotes] = useState("Speaker notes go here...\nSources:\n- https://example.com");
  const [status, setStatus] = useState<string>("");

  const { 
    isRecording, 
    startMonitoring, 
    stopMonitoring, 
    engagementData, 
    transcript,
    applySuggestion 
  } = useEngagement();

  const [isTTSEnabled, setIsTTSEnabled] = useState(true);

  // Summary & QR state
  const [presenterName, setPresenterName] = useState("");
  const [presenterTwitter, setPresenterTwitter] = useState("");
  const [presenterLinkedIn, setPresenterLinkedIn] = useState("");
  const [presenterInstagram, setPresenterInstagram] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryResult, setSummaryResult] = useState<{ url: string; qrDataUrl: string; slideCount: number } | null>(null);
  const [addSlideStatus, setAddSlideStatus] = useState("");

  // TTS Hook
  useEffect(() => {
    if (isTTSEnabled && engagementData?.suggestion) {
        import('../../lib/speech').then(({ speak }) => {
            speak(engagementData.suggestion);
        });
    }
  }, [engagementData, isTTSEnabled]);

  // Office.js Ready Hook — never throw so the pane stays open and error boundary can show any real error
  useEffect(() => {
    isMounted.current = true;
    let interval: ReturnType<typeof setInterval> | null = setInterval(() => {
      try {
        if (typeof window !== "undefined" && window.Office?.onReady) {
          window.Office.onReady(() => {
            if (isMounted.current) setReady(true);
          });
          if (interval) clearInterval(interval);
          interval = null;
        }
      } catch (_) {
        // ignore so we don't close the pane
      }
    }, 200);

    return () => {
      isMounted.current = false;
      if (interval) clearInterval(interval);
    };
  }, []);

  const handleToggleRecording = () => {
    if (isRecording) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  };

  async function insertTitleAndBullets() {
    try {
      if (!ready) return setStatus("Office not ready yet...");
      setStatus("Inserting into slide...");

      await window.PowerPoint.run(async (context: any) => {
        const slide = context.presentation.getSelectedSlides().getItemAt(0);

        const titleShape = slide.shapes.addTextBox(title);
        titleShape.left = 50;
        titleShape.top = 40;
        titleShape.width = 620;
        titleShape.height = 60;
        titleShape.textFrame.textRange.font.size = 32;

        const bulletLines = bullets.split("\n").map((s: string) => s.trim()).filter(Boolean);
        const bulletText = bulletLines.map((b: string) => `• ${b}`).join("\n");

        const bulletsShape = slide.shapes.addTextBox(bulletText);
        bulletsShape.left = 70;
        bulletsShape.top = 120;
        bulletsShape.width = 620;
        bulletsShape.height = 300;
        bulletsShape.textFrame.textRange.font.size = 20;

        await context.sync();
      });
      setStatus("Inserted ✅");
    } catch (e: any) {
      console.error(e);
      setStatus(`Error: ${e?.message ?? String(e)}`);
    }
  }

  async function insertSpeakerNotes() {
    try {
      if (!ready) return setStatus("Office not ready yet...");
      setStatus("Adding speaker notes...");

      await window.PowerPoint.run(async (context: any) => {
        const slide = context.presentation.getSelectedSlides().getItemAt(0);
        slide.notesPage.textFrame.textRange.text = notes;
        await context.sync();
      });
      setStatus("Notes inserted ✅");
    } catch (e: any) {
      console.error(e);
      setStatus(`Error: ${e?.message ?? String(e)}`);
    }
  }

  async function handleCreateSummaryAndQr() {
    setSummaryError(null);
    setSummaryResult(null);
    setSummaryLoading(true);
    try {
      const { slides } = await getAllSlidesContent();
      if (!slides.length) {
        setSummaryError("No slides found. Make sure you have at least one slide in this presentation and try again.");
        return;
      }
      const presenterSocials = {
        name: presenterName.trim() || undefined,
        twitter: presenterTwitter.trim() || undefined,
        linkedin: presenterLinkedIn.trim() || undefined,
        instagram: presenterInstagram.trim() || undefined,
      };
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides, presenterSocials }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSummaryError(data.error || "Failed to create summary");
        return;
      }
      const data = await res.json();
      setSummaryResult({ url: data.url, qrDataUrl: data.qrDataUrl, slideCount: data.slideCount });
    } catch (e: any) {
      setSummaryError(e?.message ?? "Something went wrong");
    } finally {
      setSummaryLoading(false);
    }
  }

  async function handleAddSlideWithLink() {
    if (!summaryResult?.url || !ready) return;
    setAddSlideStatus("Adding slide...");
    try {
      await insertSlideWithUrl(summaryResult.url);
      setAddSlideStatus("Slide added ✅");
    } catch (e: any) {
      setAddSlideStatus(`Error: ${e?.message ?? String(e)}`);
    }
  }

  if (!ready) {
      return (
          <div className="flex flex-col items-center justify-center h-screen bg-slate-50 p-4">
             <div className="text-center">
                 <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                 <h2 className="text-lg font-bold text-slate-800 tracking-tight">AdaptIQ</h2>
                 <p className="text-sm font-medium text-slate-500 mt-2">Connecting to PowerPoint...</p>
             </div>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* Header */}
      <header className="px-5 py-4 bg-white border-b border-slate-200 shadow-sm z-10">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-black italic tracking-tighter text-indigo-600 uppercase">AdaptIQ</h1>
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setIsTTSEnabled(!isTTSEnabled)}
                    className={`p-2 rounded-lg transition-colors ${isTTSEnabled ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 bg-slate-50'}`}
                    title={isTTSEnabled ? "Disable TTS" : "Enable TTS"}
                >
                    {isTTSEnabled ? '🔊' : '🔇'}
                </button>
                <StatusIndicator status={isRecording ? 'listening' : 'idle'} />
            </div>
        </div>
        
        {/* Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-lg">
            <button 
                onClick={() => setView("auto")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${view === "auto" ? "bg-white shadow-sm text-slate-800" : "text-slate-500"}`}
            >
                AUTO
            </button>
            <button 
                onClick={() => setView("manual")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${view === "manual" ? "bg-white shadow-sm text-slate-800" : "text-slate-500"}`}
            >
                MANUAL
            </button>
            <button 
                onClick={() => setView("summary")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${view === "summary" ? "bg-white shadow-sm text-slate-800" : "text-slate-500"}`}
            >
                WRAP-UP & QR
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-5 pb-24 space-y-5">
        
        {view === 'auto' && (
            <>
                {/* Engagement Card */}
                {engagementData ? (
                    <SuggestionCard 
                        engagementScore={engagementData.engagementScore}
                        status={engagementData.status}
                        suggestion={engagementData.suggestion}
                        actionType={engagementData.actionType}
                        onApply={() => applySuggestion(engagementData.actionType, engagementData.suggestion)}
                    />
                ) : (
                    <div className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center min-h-[220px]">
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-3xl mb-4 text-indigo-500">🎤</div>
                        <p className="text-sm text-slate-600 font-bold mb-1">Live Presentation Intelligence</p>
                        <p className="text-xs text-slate-400 max-w-[180px] mx-auto">Click "Start Analysis" and speak naturally. We'll suggest adaptations in real-time.</p>
                    </div>
                )}

                {/* Live Transcript (Progressive) */}
                {transcript && (
                    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Live Transcript</h3>
                        </div>
                        <div className="text-xs text-slate-500 leading-relaxed font-mono h-40 overflow-y-auto pr-2 custom-scrollbar italic">
                            {transcript}...
                        </div>
                    </div>
                )}
            </>
        )}

        {view === "manual" && (
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Slide Title</label>
                    <input 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter title..."
                        className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm focus:border-indigo-500 outline-none shadow-sm transition-colors"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Bullets (one per line)</label>
                    <textarea 
                        value={bullets} 
                        onChange={(e) => setBullets(e.target.value)}
                        rows={4}
                        placeholder="Enter bullets..."
                        className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm focus:border-indigo-500 outline-none shadow-sm transition-colors"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Speaker Notes</label>
                    <textarea 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        placeholder="Enter notes..."
                        className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm focus:border-indigo-500 outline-none shadow-sm transition-colors"
                    />
                </div>
                <div className="flex gap-2 pt-2">
                    <button 
                        onClick={insertTitleAndBullets}
                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-800 text-xs font-bold uppercase rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        Insert Layout
                    </button>
                    <button 
                        onClick={insertSpeakerNotes}
                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-800 text-xs font-bold uppercase rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        Save Notes
                    </button>
                </div>
                {status && (
                    <div className="text-center text-[10px] font-bold text-indigo-500 uppercase tracking-widest py-2 bg-indigo-50 rounded-lg border border-indigo-100">
                        {status}
                    </div>
                )}
            </div>
        )}

        {view === "summary" && (
            <div className="space-y-4">
                <p className="text-xs text-slate-600">Add your socials (optional). Create a wrap-up page with key takeaways and a QR so people can view it and connect with you.</p>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Your name</label>
                    <input
                        value={presenterName}
                        onChange={(e) => setPresenterName(e.target.value)}
                        placeholder="e.g. Jane Smith"
                        className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-sm focus:border-indigo-500 outline-none"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">X / Twitter</label>
                    <input
                        value={presenterTwitter}
                        onChange={(e) => setPresenterTwitter(e.target.value)}
                        placeholder="https://x.com/you or @you"
                        className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-sm focus:border-indigo-500 outline-none"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">LinkedIn</label>
                    <input
                        value={presenterLinkedIn}
                        onChange={(e) => setPresenterLinkedIn(e.target.value)}
                        placeholder="https://linkedin.com/in/you"
                        className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-sm focus:border-indigo-500 outline-none"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Instagram</label>
                    <input
                        value={presenterInstagram}
                        onChange={(e) => setPresenterInstagram(e.target.value)}
                        placeholder="https://instagram.com/you or @you"
                        className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-sm focus:border-indigo-500 outline-none"
                    />
                </div>
                <button
                    onClick={handleCreateSummaryAndQr}
                    disabled={summaryLoading || !ready}
                    className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                >
                    {summaryLoading ? "Creating wrap-up…" : "Create wrap-up and QR"}
                </button>
                {summaryError && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                        {summaryError}
                    </div>
                )}
                {summaryResult && (
                    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex justify-center">
                            <img src={summaryResult.qrDataUrl} alt="QR code" className="w-40 h-40 rounded-lg border border-slate-200" />
                        </div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Share link</p>
                        <p className="text-xs text-slate-700 break-all font-mono bg-slate-50 p-2 rounded border border-slate-100">
                            {summaryResult.url}
                        </p>
                        <p className="text-xs text-slate-500">{summaryResult.slideCount} slides summarized.</p>
                        <button
                            onClick={handleAddSlideWithLink}
                            className="w-full py-2 bg-white border border-slate-200 text-slate-800 text-xs font-bold uppercase rounded-xl hover:bg-slate-50"
                        >
                            Add slide with link
                        </button>
                        {addSlideStatus && (
                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{addSlideStatus}</p>
                        )}
                    </div>
                )}
            </div>
        )}

      </main>

      {/* Persistent Footer Controls for Auto Mode */}
      {view === 'auto' && (
        <footer className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-slate-100 z-10 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)]">
           <Controls isRecording={isRecording} onToggleRecording={handleToggleRecording} />
        </footer>
      )}
    </div>
  );
}

export default function TaskpanePage() {
  return (
    <TaskpaneErrorBoundary>
      <TaskpaneContent />
    </TaskpaneErrorBoundary>
  );
}
