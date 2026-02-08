import { useState } from "react";
import { auditSlide, researchTopic } from "../lib/ai";
import { getSlideText, getPresentationData } from "../lib/office";
import MagicScroll from "./MagicScroll";

export default function MagicDraft() {
  const [isAuditing, setIsAuditing] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [auditResults, setAuditResults] = useState<any>(null);
  const [error, setError] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportContent, setExportContent] = useState("");
  
  // Enrichment Scroll States
  const [enrichmentContent, setEnrichmentContent] = useState("");
  const [showEnrichmentBubble, setShowEnrichmentBubble] = useState(false);
  const [isScrollOpen, setIsScrollOpen] = useState(false);

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
      const data = await getPresentationData();
      if (!data || data.length === 0) {
        setError("Could not read presentation data.");
        setIsExporting(false);
        return;
      }

      // Format as Markdown
      const md = data.map((slide: any) => 
        `## Slide ${slide.index}\n${slide.content}\n`
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
    navigator.clipboard.writeText(exportContent);
    setError("Copied to clipboard! ✅"); // Quick hack to show success msg
    setTimeout(() => setError(""), 2000);
  };

  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4 relative">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
          ✨
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-slate-800">Slide Auditor</h3>
          <p className="text-[10px] text-slate-400">Refine, Enrich, & Export</p>
        </div>
        <span className="text-[8px] text-slate-300 self-start mt-1">v1.1</span>
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
        onClose={() => setIsScrollOpen(false)}
      />

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-[11px] rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-1">
          {error}
        </div>
      )}

      {/* Audit Results */}
      {auditResults && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Slide Score</span>
            <span className={`text-lg font-black ${
              auditResults.score >= 80 ? 'text-green-500' : 
              auditResults.score >= 60 ? 'text-amber-500' : 'text-red-500'
            }`}>
              {auditResults.score}/100
            </span>
          </div>
          
          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 italic border border-slate-100">
            "{auditResults.summary}"
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-slate-400">Suggestions</label>
            {auditResults.suggestions.map((suggestion: any, i: number) => (
              <div key={i} className="p-2 border border-slate-200 rounded-lg text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${
                    suggestion.type === 'clarity' ? 'bg-blue-100 text-blue-600' :
                    suggestion.type === 'brevity' ? 'bg-purple-100 text-purple-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {suggestion.type}
                  </span>
                </div>
                <p className="text-slate-700">{suggestion.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions Grid */}
      <div className="grid grid-cols-3 gap-2 pt-2">
        <ActionButton 
          icon="🧐" 
          label="Audit" 
          onClick={handleAudit} 
          isLoading={isAuditing} 
          disabled={isEnriching || isExporting} 
        />
        <ActionButton 
          icon="🧬" 
          label="Enrich" 
          onClick={handleEnrich} 
          isLoading={isEnriching} 
          disabled={isAuditing || isExporting} 
        />
        <ActionButton 
          icon="📤" 
          label="Export" 
          onClick={handleExport} 
          isLoading={isExporting} 
          disabled={isAuditing || isEnriching} 
        />
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Export Summary</h3>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 bg-slate-50/50">
              <textarea 
                readOnly 
                value={exportContent}
                className="w-full h-full min-h-[200px] p-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none resize-none font-mono text-slate-600"
              />
            </div>
            <div className="p-4 border-t border-slate-100 bg-white grid grid-cols-2 gap-3">
              <button 
                onClick={copyToClipboard}
                className="py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-colors"
              >
                Copy Markdown
              </button>
              <button 
                onClick={() => setShowExportModal(false)}
                className="py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                Close
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
