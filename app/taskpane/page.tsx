"use client";

import { useEffect, useState, useRef } from "react";
import { useMagicDraft } from "../../hooks/useMagicDraft"; 
import { useVisuals } from "../../hooks/useVisuals";
import MagicDraft from "../../components/MagicDraft";

declare global {
  interface Window {
    Office?: any;
    PowerPoint?: any;
  }
}

export default function TaskpanePage() {
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<"visuals" | "magic">("magic");
  const isMounted = useRef(true);
  
  const [status, setStatus] = useState<string>("");

  const { generateDeck, isGenerating: isMagicGenerating, error: magicError } = useMagicDraft();
  const { generateVisualForCurrentSlide, isGenerating: isVisualGenerating, error: visualError } = useVisuals();

  // Office.js Ready Hook
  useEffect(() => {
    isMounted.current = true;
    console.log("[TaskpanePage] Component mounted. Waiting for Office.onReady...");
    
    // Poll for Office.js availability
    const interval = setInterval(() => {
        if (typeof window !== 'undefined' && window.Office && window.Office.onReady) {
            window.Office.onReady(() => {
                console.log("[TaskpanePage] Office is ready.");
                if (isMounted.current) {
                    setReady(true);
                }
            });
            clearInterval(interval);
        }
    }, 200);

    return () => {
        console.log("[TaskpanePage] Component unmounting.");
        isMounted.current = false;
        clearInterval(interval);
    };
  }, []);




  const handleMagicDraft = async (notes: string, structure: string, enableResearch: boolean) => {
      console.log(`Magic Draft Triggered: ${structure}, Research: ${enableResearch}`);
      await generateDeck(notes, structure, enableResearch);
      if (!magicError) {
          setStatus("Generating Deck... Check slides!");
          // Note: magicError state might not update immediately if it's set in effect, 
          // but our hook sets it after await.
          // Better relies on UI to show error if present.
      }
  };

  if (!ready) {
      return (
          <div className="flex flex-col items-center justify-center h-screen bg-slate-50 p-4">
             <div className="text-center">
                 <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                 <h2 className="text-lg font-bold text-slate-800 tracking-tight">ADAPT AI</h2>
                 <p className="text-sm font-medium text-slate-50 mt-2">Connecting to PowerPoint...</p>
             </div>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* Header */}
      <header className="px-5 py-4 bg-white border-b border-slate-200 shadow-sm z-10">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-black italic tracking-tighter text-indigo-600 uppercase">ADAPT AI</h1>
            <p className="text-[10px] font-bold text-slate-400 leading-tight">
                SMART ✨
            </p>
        </div>
        
        {/* Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-lg">
            <button 
                onClick={() => setView("visuals")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${view === 'visuals' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
            >
                VISUALS
            </button>
            <button 
                onClick={() => setView("magic")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${view === 'magic' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
            >
                SMART ✨
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-5 pb-24 space-y-5 relative">
        
        {/* Generating Overlay */}
        {(isMagicGenerating || isVisualGenerating) && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <h3 className="text-lg font-bold text-slate-800">
                    {isMagicGenerating ? "Architecting Your Deck..." : "Imagining Visual Metaphor..."}
                </h3>
                <p className="text-xs text-slate-500 mt-2 max-w-[200px]">
                    {isMagicGenerating 
                        ? "We're turning your notes into a structured narrative." 
                        : "Analyzing your slide and creating a custom 3D render."}
                    <br/>Please don't close PowerPoint.
                </p>
            </div>
        )}

        {view === 'visuals' ? (
            <>
                {/* Visual Metaphor Trigger */}
                <div style={{background: 'linear-gradient(135deg, #9f0e3d 0%, #b2470d 100%)'}} className="rounded-2xl p-4 shadow-lg border border-[#9f0e3d] flex flex-col items-center text-center gap-3 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                    <div className="text-2xl">🎨</div>
                    <div>
                        <h3 className="text-white font-black text-sm tracking-tight">ENHANCE WITH VISUALS</h3>
                        <p className="text-white/90 text-[10px] opacity-80 mt-0.5">Generate a custom 3D metaphor for this slide</p>
                    </div>
                    <button 
                        onClick={generateVisualForCurrentSlide}
                        disabled={isVisualGenerating || isMagicGenerating}
                        className="w-full bg-white font-black py-2.5 rounded-xl text-[10px] tracking-widest uppercase hover:bg-slate-900 hover:text-white transition-all active:scale-95 shadow-md"
                        style={{color: '#9f0e3d'}}
                    >
                        {isVisualGenerating ? 'IMAGINING...' : 'GENERATE VISUAL'}
                    </button>
                    {(visualError) && (
                        <p className="text-[9px] font-bold text-red-200 mt-1">{visualError}</p>
                    )}
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <p className="text-[10px] text-slate-500">
                        Use this tab to add visual flair to your slides. 
                        More visual tools coming soon!
                    </p>
                </div>
            </>
        ) : (
            <div className="space-y-4">
                <MagicDraft />
                
                {magicError && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold text-center">
                        {magicError}
                    </div>
                )}

                {status && !magicError && (
                    <div className="text-center text-[10px] font-bold text-indigo-500 uppercase tracking-widest py-2 bg-indigo-50 rounded-lg border border-indigo-100">
                        {status}
                    </div>
                )}
            </div>
        )}

      </main>


    </div>
  );
}
