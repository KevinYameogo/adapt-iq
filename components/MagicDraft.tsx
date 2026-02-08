import { useState, useEffect } from "react";
import { auditSlide, researchTopic, generateSmartSummary } from "../lib/ai";
import { getSlideText, getPresentationStructuredData, getPresentationInfo, getCurrentSlideId, getCurrentSlideIndex } from "../lib/office";
import { exportToExcel, exportToPDF, exportToWord } from "../lib/export";
import { getSavedNotes, saveNote, deleteNote, SavedNote } from "../lib/store";
import MagicScroll from "./MagicScroll";

export default function MagicDraft() {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [smartSummary, setSmartSummary] = useState<any>(null);
  const [auditResults, setAuditResults] = useState<any>(null);
  const [error, setError] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportContent, setExportContent] = useState("");
  const [structuredData, setStructuredData] = useState<any[]>([]);
  
  // Notes Hub State
  const [activeTab, setActiveTab] = useState<"copilot" | "library">("copilot");
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
  const [presentationInfo, setPresentationInfo] = useState<{name: string, url: string} | null>(null);

  // Load notes & info on mount
  useEffect(() => {
    setSavedNotes(getSavedNotes());
    getPresentationInfo().then(info => setPresentationInfo(info));
  }, []);
  
  // Enrichment Scroll States
  const [enrichmentContent, setEnrichmentContent] = useState("");
  const [showEnrichmentBubble, setShowEnrichmentBubble] = useState(false);
  const [isScrollOpen, setIsScrollOpen] = useState(false);

  const handleSmartSummary = async () => {
    setIsSummarizing(true);
    setError("");
    setSmartSummary(null);
    try {
      const text = await getSlideText();
      
      if (text === "ERR_NO_SLIDE_SELECTED") {
        setError("No slide selected.");
        setIsSummarizing(false);
        return;
      }

      if (!text || text.trim().length === 0) {
         console.warn("Empty text, proceeding with fallback Summary generation");
      }

      const results = await generateSmartSummary(text);
      const slideId = await getCurrentSlideId();
      const slideIndex = await getCurrentSlideIndex();
      
      setSmartSummary({ ...results, slideId, slideIndex }); // Save ID with local state too

    } catch (e) {
      console.error("Smart Summary failed:", e);
      setError("Failed to generate summary.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleApplyNotes = async () => {
    // Only save to Library (already auto-saved, but user might re-click)
    if (smartSummary && presentationInfo) {
        saveNote({
            presentationName: presentationInfo.name,
            presentationUrl: presentationInfo.url,
            slideIndex: smartSummary.slideIndex || 1, 
            slideId: smartSummary.slideId,
            summary: smartSummary.summary,
            speakerNotes: smartSummary.speakerNotes,
            researchTags: smartSummary.researchTags || []
        });
        setSavedNotes(getSavedNotes()); 
        setActiveTab("library"); // Switch to library to show it
    }
  };

  const handleAudit = async () => {
    setIsAuditing(true);
    setError("");
    setAuditResults(null);
    try {
      const text = await getSlideText();
      
      if (text === "ERR_NO_SLIDE_SELECTED") {
        setError("No slide selected. Please click on a slide in the left sidebar.");
        setIsAuditing(false);
        return;
      }

      if (!text || text.trim().length === 0) {
        setError("COULD NOT FIND SLIDE TEXT (v1.1). If the slide isn't empty, it might be an unsupported shape type. Try adding a simple text box to test.");
        setIsAuditing(false);
        return;
      }

      const results = await auditSlide(text);
      setAuditResults(results);
    } catch (e) {
      console.error("Audit failed:", e);
      setError("Failed to audit slide. Please try again.");
    } finally {
      setIsAuditing(false);
    }
  };

  const handleEnrich = async () => {
    setIsEnriching(true);
    setError("");
    setShowEnrichmentBubble(false);
    try {
      const text = await getSlideText();
      if (!text || text.trim().length === 0 || text === "ERR_NO_SLIDE_SELECTED") {
        setError("Please select a slide with text to enrich.");
        setIsEnriching(false);
        return;
      }

      const topic = text.substring(0, 50).trim();
      const research = await researchTopic(topic);
      
      if (!research) {
        setError("No research findings found for this content.");
      } else {
        setEnrichmentContent(research);
        setShowEnrichmentBubble(true);
      }
    } catch (e) {
      console.error("Enrichment failed:", e);
      setError("Failed to enrich slide.");
    } finally {
      setIsEnriching(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setError("");
    try {
      // Export Strategy: Prioritize Saved Notes (Library)
      // This is safer on Mac and gives user control ("Select slides manually by saving them")
      
      let dataToExport: any[] = [];
      const notes = getSavedNotes();

      if (notes && notes.length > 0) {
        console.log("[MagicDraft] Exporting from Library (Safe Mode)");
        // Convert notes to export format
        dataToExport = notes.map(n => ({
            index: n.slideIndex,
            text: `## Executive Insight\n${n.summary}\n\n## Speaker Notes\n${n.speakerNotes}\n\n## Research Topics\n${n.researchTags.join(", ")}`,
            tables: [] 
        })).sort((a, b) => a.index - b.index);
      } else {
        // Fallback: Try current slide capture if library is empty
        console.warn("[MagicDraft] Library empty. Exporting current slide.");
        const currentText = await getSlideText();
        const currentIndex = await getCurrentSlideIndex();
        
        if (currentText && currentText.length > 0) {
            dataToExport = [{
                index: currentIndex,
                text: currentText,
                tables: []
            }];
        }
      }

      if (!dataToExport || dataToExport.length === 0) {
        setError("Nothing to export. Save some insights to your Library first!");
        setIsExporting(false);
        return;
      }

      setStructuredData(dataToExport);

      // Format as Markdown for preview/copy
      const md = dataToExport.map((slide: any) => 
        `## Slide ${slide.index}\n${slide.text}`
      ).join("\n---\n\n");

      setExportContent(md);
      setShowExportModal(true);

    } catch (e) {
      console.error("Export failed:", e);
      setError("Failed to export summary.");
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(exportContent);
        setError("Copied to clipboard! ✅");
      } else {
        throw new Error("Clipboard API unavailable");
      }
    } catch (err) {
      // Fallback for restricted environments (like Office IFrames)
      const textArea = document.createElement("textarea");
      textArea.value = exportContent;
      // Ensure it's not visible
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setError("Copied to clipboard! ✅ (Fallback)");
      } catch (copyErr) {
        console.error('Fallback copy failed', copyErr);
        setError("Could not copy. Please select and copy manually.");
      }
      document.body.removeChild(textArea);
    }
    setTimeout(() => setError(""), 2000);
  };

  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4 relative">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black">
          {activeTab === "copilot" ? "S" : "📚"}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-slate-800">
            {activeTab === "copilot" ? "Smart" : "Notes Library"}
          </h3>
          <p className="text-[10px] text-slate-400">
            {activeTab === "copilot" ? "Analyze • Research • Present" : "Your Saved Insights"}
          </p>
        </div>
        <div className="flex bg-slate-100 p-0.5 rounded-lg">
             <button 
                onClick={() => setActiveTab("copilot")}
                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${activeTab === "copilot" ? "bg-white shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
             >
                Smart
             </button>
             <button 
                onClick={() => setActiveTab("library")}
                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${activeTab === "library" ? "bg-white shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
             >
                Library
             </button>
        </div>
      </div>

      {/* Magic Scroll Trigger (Glowing Bubble) */}
      {showEnrichmentBubble && (
        <button
          onClick={() => setIsScrollOpen(true)}
          className="absolute -top-6 -right-2 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/50 hover:scale-110 active:scale-95 transition-all z-20 animate-pulse border-2 border-white"
          title="Open The Alexandria Library"
        >
          🏰
          <div className="absolute inset-0 rounded-full animate-ping bg-indigo-400 opacity-20"></div>
        </button>
      )}

      {/* Magic Scroll Component */}
      <MagicScroll 
        content={enrichmentContent}
        isOpen={isScrollOpen}
        onClose={() => {
            setIsScrollOpen(false);
            setShowEnrichmentBubble(false); // Hide the bubble when closed
        }}
      />

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-[11px] rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-1">
          {error}
        </div>
      )}

      {/* Audit Results */}
      {/* Smart Summary Results (Copilot Tab) */}
      {activeTab === "copilot" && smartSummary && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          
          {/* Executive Summary */}
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
             <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">💡</span>
                <span className="text-[10px] font-bold uppercase text-indigo-400">Executive Insight</span>
             </div>
             <p className="text-xs font-medium text-slate-700 leading-relaxed italic">
                "{smartSummary.summary}"
             </p>
          </div>

          {/* Speaker Notes */}
          <div className="relative group">
             <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">AI Speaker Coach</span>
                <button 
                    onClick={handleApplyNotes}
                    className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full hover:bg-indigo-100 transition-colors"
                >
                    + SAVE TO LIBRARY
                </button>
             </div>
             <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
                {smartSummary.speakerNotes}
             </div>
          </div>

          {/* Research Tags */}
          <div className="space-y-2">
             <span className="text-[10px] font-bold uppercase text-slate-400 px-1">Research Topics</span>
             <div className="flex flex-wrap gap-2">
                {smartSummary.researchTags?.map((tag: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-600 shadow-sm">
                        🔍 {tag}
                    </span>
                ))}
             </div>
          </div>

        </div>
      )}

      {/* Library Tab */}
      {activeTab === "library" && (
         <div className="space-y-3 animate-in fade-in slide-in-from-right-2">
            {savedNotes.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                    <div className="text-2xl mb-2">📚</div>
                    <p className="text-xs">No saved notes yet.</p>
                    <p className="text-[10px]">Use the Copilot to generate and verify insights!</p>
                </div>
            ) : (
                savedNotes.map((note) => (
                    <div key={note.id} className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-200 transition-all">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[150px] truncate" title={note.presentationName}>
                                  {note.presentationName.length > 20 ? note.presentationName.substring(0, 20) + "..." : note.presentationName}
                                </h4>
                                <span className="text-[9px] text-slate-400">{new Date(note.timestamp).toLocaleDateString()}</span>
                            </div>
                            {note.presentationUrl && (
                                <a 
                                    href={note.presentationUrl + 
                                        (note.presentationUrl.includes("?") ? "&web=1" : "?web=1") + 
                                        (note.slideId ? "&wdSlideId=" + note.slideId : "")} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-[9px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-bold hover:bg-blue-100 transition-colors"
                                >
                                    OPEN ↗
                                </a>
                            )}
                            {!note.presentationUrl && (
                                <span className="text-[9px] bg-slate-50 text-slate-400 px-2 py-1 rounded-full font-bold">Local File</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                             <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">Slide {note.slideIndex}</span>
                        </div>
                        <p className="text-[10px] text-slate-600 italic mb-2 border-l-2 border-indigo-200 pl-2">"{note.summary}"</p>
                        
                        {/* Display Speaker Notes in Library */}
                        <div className="mb-2 p-2 bg-slate-50 rounded border border-slate-100 text-[10px] text-slate-600 leading-relaxed">
                            <span className="block text-[8px] font-bold uppercase text-slate-400 mb-1">Speaker Notes</span>
                            {note.speakerNotes}
                        </div>

                        <div className="flex gap-1 flex-wrap">
                            {note.researchTags?.slice(0, 2).map((tag, i) => (
                                <span key={i} className="text-[8px] px-1.5 py-0.5 bg-slate-50 rounded text-slate-500 border border-slate-100">{tag}</span>
                            ))}
                        </div>
                         <div className="mt-2 flex justify-end">
                            <button 
                                onClick={() => {
                                    deleteNote(note.id);
                                    setSavedNotes(getSavedNotes());
                                }}
                                className="text-[9px] text-red-400 hover:text-red-600 font-medium"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))
            )}
         </div>
      )}

      {/* Actions Grid (Only visible in Copilot mode) */}
      {activeTab === "copilot" && (
      <div className="grid grid-cols-3 gap-2 pt-2">
        <ActionButton 
          icon="⚡️" 
          label="Analyze" 
          onClick={handleSmartSummary} 
          isLoading={isSummarizing} 
          disabled={isEnriching || isExporting} 
          primary={true}
        />
        <ActionButton 
          icon="🧬" 
          label="Research" 
          onClick={handleEnrich} 
          isLoading={isEnriching} 
          disabled={isSummarizing || isExporting} 
        />
        <ActionButton 
          icon="📤" 
          label="Export" 
          onClick={handleExport} 
          isLoading={isExporting} 
          disabled={isSummarizing || isEnriching} 
        />
      </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Expert Export</h3>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 bg-slate-50/50 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-400">Download Document</label>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => exportToPDF(structuredData)} className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all gap-1">
                    <span className="text-xl">PDF</span>
                  </button>
                  <button onClick={() => exportToExcel(structuredData)} className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all gap-1">
                    <span className="text-xl">XLS</span>
                  </button>
                  <button onClick={() => exportToWord(structuredData)} className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all gap-1">
                    <span className="text-xl">DOC</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-400">Markdown Preview</label>
                <textarea 
                  readOnly 
                  value={exportContent}
                  className="w-full min-h-[120px] p-3 text-[10px] bg-white border border-slate-200 rounded-xl focus:outline-none resize-none font-mono text-slate-600"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-white flex flex-col gap-2">
              <button 
                onClick={copyToClipboard}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-colors"
              >
                Copy Markdown
              </button>
              <button 
                onClick={() => setShowExportModal(false)}
                className="w-full py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper for button consistency
function ActionButton({ icon, label, onClick, isLoading, disabled }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`py-2 px-1 rounded-xl font-bold text-[10px] transition-all border flex flex-col items-center justify-center gap-1 h-16 ${
        isLoading
          ? "bg-slate-50 border-slate-200 text-slate-400"
          : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm"
      }`}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-400 rounded-full animate-spin" />
      ) : (
        <span className="text-xl">{icon}</span>
      )}
      <span>{label}</span>
    </button>
  );
}
