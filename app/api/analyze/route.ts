"use client";
import { useEffect, useState, useRef } from "react";
import { useEngagement } from "../hooks/useEngagement"; // Adjust paths if necessary
import StatusIndicator from "../components/StatusIndicator";
import Controls from "../components/Controls";
import SuggestionCard from "../components/SuggestionCard";
import { QRCodeSVG } from 'qrcode.react';

export default function Home() {
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<"auto" | "manual" | "share">("auto");
  const isMounted = useRef(true);

  // 1. CRITICAL OFFICE INITIALIZATION
  useEffect(() => {
    isMounted.current = true;
    
    const checkOffice = setInterval(() => {
      if (typeof window !== 'undefined' && window.Office && window.Office.onReady) {
        window.Office.onReady((info: any) => {
          if (isMounted.current && info.host === window.Office.HostType.PowerPoint) {
            setReady(true);
            console.log("AdaptIQ: Connected to PowerPoint");
          }
        });
        clearInterval(checkOffice);
      }
    }, 250);

    return () => {
      isMounted.current = false;
      clearInterval(checkOffice);
    };
  }, []);

  // ... (Keep your existing state: title, bullets, notes, status, qrValues, isGeneratingQR)
  const [title, setTitle] = useState("AI Slide Title");
  const [bullets, setBullets] = useState("First bullet\nSecond bullet\nThird bullet");
  const [notes, setNotes] = useState("Speaker notes go here...");
  const [status, setStatus] = useState("");
  const [qrValues, setQrValues] = useState<{ url: string; id: string } | null>(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  // ... (Keep your useEngagement hook and handleToggleRecording logic)
  const { isRecording, startMonitoring, stopMonitoring, engagementData, transcript } = useEngagement();

  // 2. LOADING STATE (This is what you'll see while connecting)
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

  // 3. MAIN UI (The sidebar content)
  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* ... Put your Header, Tabs, and Main Content (Auto/Manual/Share) here ... */}
      <header className="px-5 py-4 bg-white border-b border-slate-200">
         <h1 className="text-xl font-black italic text-indigo-600 uppercase">AdaptIQ</h1>
         {/* ... Your Tab Buttons ... */}
      </header>
      
      <main className="flex-1 overflow-y-auto p-5">
         {view === "share" && (
           <div className="text-center">
             {/* Your QR Code logic from before */}
             {qrValues && <QRCodeSVG value={qrValues.url} size={180} />}
           </div>
         )}
         {/* ... (Other views) ... */}
      </main>
    </div>
  );
}